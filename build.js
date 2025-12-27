#!/usr/bin/env node

/**
 * Build Script - Generates manifest.json from content folder structure
 *
 * Scans the content/ directory and creates a manifest of all skills,
 * topics, and articles for the navigation system.
 *
 * Usage: node build.js
 *
 * Folder structure:
 *   content/
 *     ├── SkillName/
 *     │   ├── _meta.json (optional: { "name": "Display Name", "order": 1 })
 *     │   └── TopicName/
 *     │       ├── _meta.json (optional)
 *     │       └── article-name.md
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');
const MANIFEST_PATH = path.join(CONTENT_DIR, 'manifest.json');

/**
 * Convert a folder/file name to a display name
 * @param {string} name - The folder or file name
 * @returns {string} Display name
 */
function toDisplayName(name) {
    return name
        // Remove file extension
        .replace(/\.md$/, '')
        // Replace hyphens and underscores with spaces
        .replace(/[-_]/g, ' ')
        // Capitalize each word
        .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Convert a name to a URL-friendly slug
 * @param {string} name - The name to slugify
 * @returns {string} URL slug
 */
function toSlug(name) {
    return name
        .replace(/\.md$/, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/**
 * Read metadata from _meta.json if it exists
 * @param {string} dirPath - Directory path
 * @returns {Object} Metadata object
 */
function readMeta(dirPath) {
    const metaPath = path.join(dirPath, '_meta.json');
    if (fs.existsSync(metaPath)) {
        try {
            const content = fs.readFileSync(metaPath, 'utf-8');
            return JSON.parse(content);
        } catch (e) {
            console.warn(`Warning: Could not parse ${metaPath}`);
        }
    }
    return {};
}

/**
 * Extract title from markdown frontmatter
 * @param {string} filePath - Path to markdown file
 * @returns {string|null} Title or null
 */
function extractTitle(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
            if (titleMatch) {
                return titleMatch[1].trim().replace(/^["']|["']$/g, '');
            }
        }

        // Fallback: use first H1 heading
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
            return h1Match[1].trim();
        }
    } catch (e) {
        console.warn(`Warning: Could not read ${filePath}`);
    }
    return null;
}

/**
 * Scan a topic directory for articles
 * @param {string} topicPath - Path to topic directory
 * @param {string} topicName - Topic folder name
 * @returns {Object} Topic object with articles
 */
function scanTopic(topicPath, topicName) {
    const meta = readMeta(topicPath);
    const articles = [];

    const items = fs.readdirSync(topicPath);

    items.forEach(item => {
        // Skip hidden files, meta files, and non-markdown files
        if (item.startsWith('.') || item.startsWith('_') || !item.endsWith('.md')) {
            return;
        }

        const articlePath = path.join(topicPath, item);
        const stat = fs.statSync(articlePath);

        if (stat.isFile()) {
            const slug = toSlug(item);
            const title = extractTitle(articlePath) || toDisplayName(item);

            articles.push({
                slug,
                title,
                file: item.replace(/\.md$/, '') // Store filename without extension
            });
        }
    });

    // Sort articles by title
    articles.sort((a, b) => a.title.localeCompare(b.title));

    return {
        slug: toSlug(topicName),
        name: meta.name || toDisplayName(topicName),
        folder: topicName, // Store actual folder name
        order: meta.order || 999,
        articles
    };
}

/**
 * Scan a skill directory for topics
 * @param {string} skillPath - Path to skill directory
 * @param {string} skillName - Skill folder name
 * @returns {Object} Skill object with topics
 */
function scanSkill(skillPath, skillName) {
    const meta = readMeta(skillPath);
    const topics = [];

    const items = fs.readdirSync(skillPath);

    items.forEach(item => {
        // Skip hidden files and meta files
        if (item.startsWith('.') || item.startsWith('_')) {
            return;
        }

        const itemPath = path.join(skillPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            const topic = scanTopic(itemPath, item);
            if (topic.articles.length > 0) {
                topics.push(topic);
            }
        }
    });

    // Sort topics by order, then by name
    topics.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
    });

    return {
        slug: toSlug(skillName),
        name: meta.name || toDisplayName(skillName),
        folder: skillName, // Store actual folder name
        order: meta.order || 999,
        topics
    };
}

/**
 * Scan content directory and generate manifest
 * @returns {Object} Manifest object
 */
function generateManifest() {
    // Create content directory if it doesn't exist
    if (!fs.existsSync(CONTENT_DIR)) {
        fs.mkdirSync(CONTENT_DIR, { recursive: true });
        console.log('Created content/ directory');
    }

    const skills = [];
    const items = fs.readdirSync(CONTENT_DIR);

    items.forEach(item => {
        // Skip hidden files, meta files, and non-directories
        if (item.startsWith('.') || item.startsWith('_') || item === 'manifest.json') {
            return;
        }

        const itemPath = path.join(CONTENT_DIR, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            const skill = scanSkill(itemPath, item);
            if (skill.topics.length > 0) {
                skills.push(skill);
            }
        }
    });

    // Sort skills by order, then by name
    skills.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
    });

    return {
        generated: new Date().toISOString(),
        skills
    };
}

/**
 * Main function
 */
function main() {
    console.log('Scanning content directory...');

    const manifest = generateManifest();

    // Write manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    // Print summary
    let totalArticles = 0;
    let totalTopics = 0;

    manifest.skills.forEach(skill => {
        totalTopics += skill.topics.length;
        skill.topics.forEach(topic => {
            totalArticles += topic.articles.length;
        });
    });

    console.log('\n✓ Manifest generated successfully!');
    console.log(`  Skills: ${manifest.skills.length}`);
    console.log(`  Topics: ${totalTopics}`);
    console.log(`  Articles: ${totalArticles}`);
    console.log(`\n  Output: ${MANIFEST_PATH}`);
}

// Run
main();
