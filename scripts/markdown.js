/**
 * Markdown - Handles loading and rendering markdown content
 * Uses marked.js for parsing, highlight.js for code highlighting,
 * and DOMPurify for HTML sanitization
 */

class MarkdownRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.currentPath = null;
        this.onRender = null;

        // Configure marked
        this.configureMarked();
    }

    /**
     * Configure marked.js with options
     */
    configureMarked() {
        // Custom renderer for heading IDs
        const renderer = new marked.Renderer();

        // Generate slug from text
        const slugify = (text) => {
            return text
                .toLowerCase()
                .replace(/<[^>]*>/g, '')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        };

        // Add IDs to headings for TOC linking
        renderer.heading = (text, level, raw) => {
            const id = slugify(raw);
            return `<h${level} id="${id}">${text}</h${level}>`;
        };

        // External links open in new tab
        renderer.link = (href, title, text) => {
            const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
            const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
        };

        marked.setOptions({
            renderer: renderer,
            langPrefix: 'hljs language-',
            gfm: true,
            breaks: false,
            pedantic: false
        });
    }

    /**
     * Sanitize HTML using DOMPurify
     * @param {string} html - Raw HTML string
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        return DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true },
            ADD_ATTR: ['target', 'rel', 'class'],
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'ul', 'ol', 'li',
                'blockquote', 'pre', 'code',
                'a', 'strong', 'em', 'del', 's',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'img', 'span', 'div'
            ]
        });
    }

    /**
     * Load and render a markdown file
     * @param {string} path - Path to the markdown file
     */
    async load(path) {
        if (!path) {
            this.renderWelcome();
            return;
        }

        this.currentPath = path;
        this.renderLoading();

        try {
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`Failed to load: ${response.status}`);
            }

            const markdown = await response.text();
            const { meta, content } = this.parseFrontmatter(markdown);
            this.render(content, meta);

        } catch (error) {
            console.error('Failed to load markdown:', error);
            this.renderError(path);
        }
    }

    /**
     * Parse YAML frontmatter from markdown
     * @param {string} markdown
     * @returns {Object} { meta, content }
     */
    parseFrontmatter(markdown) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);

        if (!match) {
            return { meta: {}, content: markdown };
        }

        const frontmatter = match[1];
        const content = match[2];

        // Simple YAML parser for basic key: value pairs
        const meta = {};
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();
                meta[key] = value;
            }
        });

        return { meta, content };
    }

    /**
     * Render markdown content safely
     * @param {string} content - Markdown content
     * @param {Object} meta - Frontmatter metadata
     */
    render(content, meta = {}) {
        // Parse markdown to HTML
        const rawHtml = marked.parse(content);
        // Sanitize with DOMPurify
        const safeHtml = this.sanitizeHtml(rawHtml);

        // Create article element
        const article = document.createElement('article');
        article.className = 'article';

        // Add metadata header if present
        if (meta.date) {
            const metaDiv = this.createMetaElement(meta);
            article.appendChild(metaDiv);
        }

        // Create content container and set sanitized HTML
        const contentDiv = document.createElement('div');
        contentDiv.className = 'article-content';

        // Create a template element to safely parse the HTML
        const template = document.createElement('template');
        template.innerHTML = safeHtml;
        contentDiv.appendChild(template.content);

        article.appendChild(contentDiv);

        // Clear and append
        this.container.textContent = '';
        this.container.appendChild(article);

        // Apply syntax highlighting to code blocks
        if (typeof hljs !== 'undefined') {
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                // Map Apex to Java for highlighting (similar syntax)
                if (block.className.includes('language-apex')) {
                    block.className = block.className.replace('language-apex', 'language-java');
                }
                hljs.highlightElement(block);
            });
        }

        // Trigger callback for TOC generation
        if (this.onRender) {
            this.onRender(contentDiv);
        }
    }

    /**
     * Create metadata element
     * @param {Object} meta
     * @returns {HTMLElement}
     */
    createMetaElement(meta) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'article-meta';

        const dateItem = document.createElement('div');
        dateItem.className = 'article-meta-item';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '3'); rect.setAttribute('y', '4');
        rect.setAttribute('width', '18'); rect.setAttribute('height', '18');
        rect.setAttribute('rx', '2'); rect.setAttribute('ry', '2');

        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '16'); line1.setAttribute('y1', '2');
        line1.setAttribute('x2', '16'); line1.setAttribute('y2', '6');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '8'); line2.setAttribute('y1', '2');
        line2.setAttribute('x2', '8'); line2.setAttribute('y2', '6');

        const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line3.setAttribute('x1', '3'); line3.setAttribute('y1', '10');
        line3.setAttribute('x2', '21'); line3.setAttribute('y2', '10');

        svg.appendChild(rect);
        svg.appendChild(line1);
        svg.appendChild(line2);
        svg.appendChild(line3);
        dateItem.appendChild(svg);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = this.formatDate(meta.date);
        dateItem.appendChild(dateSpan);

        metaDiv.appendChild(dateItem);
        return metaDiv;
    }

    /**
     * Format date string
     * @param {string} dateStr
     * @returns {string}
     */
    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    }

    /**
     * Render welcome screen
     */
    renderWelcome() {
        this.container.textContent = '';

        const article = document.createElement('article');
        article.className = 'article';

        const welcome = document.createElement('div');
        welcome.className = 'welcome';

        // Icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'welcome-icon';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.5');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20');
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z');
        svg.appendChild(path1);
        svg.appendChild(path2);
        iconDiv.appendChild(svg);
        welcome.appendChild(iconDiv);

        // Title
        const h1 = document.createElement('h1');
        h1.textContent = 'Welcome to MyBlogs';
        welcome.appendChild(h1);

        // Description
        const p = document.createElement('p');
        p.textContent = 'Select an article from the sidebar to start reading, or use the search to find what you\'re looking for.';
        welcome.appendChild(p);

        // Shortcuts
        const shortcuts = document.createElement('div');
        shortcuts.className = 'welcome-shortcuts';

        const shortcutData = [
            { key: '/', label: 'Search' },
            { key: 'T', label: 'Toggle theme' },
            { key: 'B', label: 'Toggle sidebar' }
        ];

        shortcutData.forEach(({ key, label }) => {
            const shortcut = document.createElement('div');
            shortcut.className = 'shortcut';

            const kbd = document.createElement('kbd');
            kbd.textContent = key;
            shortcut.appendChild(kbd);

            const span = document.createElement('span');
            span.textContent = label;
            shortcut.appendChild(span);

            shortcuts.appendChild(shortcut);
        });

        welcome.appendChild(shortcuts);
        article.appendChild(welcome);
        this.container.appendChild(article);

        // Clear TOC
        if (this.onRender) {
            this.onRender(null);
        }
    }

    /**
     * Render loading state
     */
    renderLoading() {
        this.container.textContent = '';

        const loading = document.createElement('div');
        loading.className = 'loading';
        this.container.appendChild(loading);
    }

    /**
     * Render error state
     * @param {string} path
     */
    renderError(path) {
        this.container.textContent = '';

        const article = document.createElement('article');
        article.className = 'article';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'empty-state';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '15'); line1.setAttribute('y1', '9');
        line1.setAttribute('x2', '9'); line1.setAttribute('y2', '15');
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '9'); line2.setAttribute('y1', '9');
        line2.setAttribute('x2', '15'); line2.setAttribute('y2', '15');
        svg.appendChild(circle);
        svg.appendChild(line1);
        svg.appendChild(line2);
        errorDiv.appendChild(svg);

        const p = document.createElement('p');
        p.textContent = 'Article not found. The file may have been moved or deleted.';
        errorDiv.appendChild(p);

        article.appendChild(errorDiv);
        this.container.appendChild(article);

        if (this.onRender) {
            this.onRender(null);
        }
    }
}
