/**
 * Router - Hash-based routing for static site
 * Handles URL navigation like #/Skill/Topic/article-name
 */

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.onRouteChange = null;

        // Listen for hash changes only - app.js will trigger initial route
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    /**
     * Parse the current hash into route parts
     * @returns {Object} { skill, topic, article, path }
     */
    parseHash() {
        const hash = window.location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);

        return {
            skill: parts[0] || null,
            topic: parts[1] || null,
            article: parts[2] || null,
            path: hash,
            parts: parts
        };
    }

    /**
     * Navigate to a specific path
     * @param {string} path - The path to navigate to
     */
    navigate(path) {
        if (!path.startsWith('#')) {
            path = '#' + path;
        }
        window.location.hash = path;
    }

    /**
     * Build a path from parts
     * @param {string} skill
     * @param {string} topic
     * @param {string} article
     * @returns {string}
     */
    buildPath(skill, topic, article) {
        const parts = [''];
        if (skill) parts.push(skill);
        if (topic) parts.push(topic);
        if (article) parts.push(article);
        return parts.join('/');
    }

    /**
     * Handle route changes
     */
    handleRoute() {
        const route = this.parseHash();
        this.currentRoute = route;

        if (this.onRouteChange) {
            this.onRouteChange(route);
        }
    }

    /**
     * Get the article path for fetching markdown
     * @param {Object} route
     * @returns {string|null}
     */
    getArticlePath(route) {
        if (!route.skill || !route.topic || !route.article) {
            return null;
        }
        return `content/${route.skill}/${route.topic}/${route.article}.md`;
    }

    /**
     * Check if current route matches given parameters
     * @param {string} skill
     * @param {string} topic
     * @param {string} article
     * @returns {boolean}
     */
    isActive(skill, topic, article) {
        const current = this.currentRoute || this.parseHash();

        if (article) {
            return current.skill === skill &&
                   current.topic === topic &&
                   current.article === article;
        }
        if (topic) {
            return current.skill === skill && current.topic === topic;
        }
        if (skill) {
            return current.skill === skill;
        }
        return false;
    }

    /**
     * Check if a skill should be expanded (contains current route)
     * @param {string} skill
     * @returns {boolean}
     */
    shouldExpandSkill(skill) {
        const current = this.currentRoute || this.parseHash();
        return current.skill === skill;
    }

    /**
     * Check if a topic should be expanded (contains current route)
     * @param {string} skill
     * @param {string} topic
     * @returns {boolean}
     */
    shouldExpandTopic(skill, topic) {
        const current = this.currentRoute || this.parseHash();
        return current.skill === skill && current.topic === topic;
    }
}

// Create global router instance
const router = new Router();
