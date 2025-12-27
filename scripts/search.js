/**
 * Search - Client-side search functionality
 * Searches across article titles and content with instant results
 */

class Search {
    constructor(inputSelector, resultsSelector) {
        this.input = document.querySelector(inputSelector);
        this.results = document.querySelector(resultsSelector);
        this.articles = [];
        this.articleContents = new Map();
        this.activeIndex = -1;
        this.isOpen = false;

        this.init();
    }

    /**
     * Initialize search
     */
    init() {
        // Input events
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('focus', () => this.handleFocus());
        this.input.addEventListener('blur', () => this.handleBlur());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.results.contains(e.target)) {
                this.close();
            }
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !this.isInputFocused()) {
                e.preventDefault();
                this.input.focus();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.input.blur();
            }
        });
    }

    /**
     * Check if any input is focused
     */
    isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    }

    /**
     * Set articles data from navigation
     * @param {Array} articles
     */
    setArticles(articles) {
        this.articles = articles;
    }

    /**
     * Handle input change
     */
    handleInput() {
        const query = this.input.value.trim().toLowerCase();

        if (query.length < 2) {
            this.close();
            return;
        }

        const results = this.search(query);
        this.showResults(results);
    }

    /**
     * Handle focus
     */
    handleFocus() {
        const query = this.input.value.trim().toLowerCase();
        if (query.length >= 2) {
            const results = this.search(query);
            this.showResults(results);
        }
    }

    /**
     * Handle blur
     */
    handleBlur() {
        // Delay to allow click on results
        setTimeout(() => {
            if (!this.results.contains(document.activeElement)) {
                this.close();
            }
        }, 200);
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e
     */
    handleKeydown(e) {
        if (!this.isOpen) return;

        const items = this.results.querySelectorAll('.search-result-item');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
                this.updateActiveItem(items);
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                this.updateActiveItem(items);
                break;

            case 'Enter':
                e.preventDefault();
                if (this.activeIndex >= 0 && items[this.activeIndex]) {
                    items[this.activeIndex].click();
                }
                break;

            case 'Escape':
                this.close();
                this.input.blur();
                break;
        }
    }

    /**
     * Update active item styling
     * @param {NodeList} items
     */
    updateActiveItem(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.activeIndex);
        });

        // Scroll active item into view
        if (items[this.activeIndex]) {
            items[this.activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    /**
     * Search articles
     * @param {string} query
     * @returns {Array}
     */
    search(query) {
        const terms = query.split(/\s+/).filter(Boolean);

        return this.articles
            .map(article => {
                let score = 0;

                // Title match (highest priority)
                const titleLower = article.title.toLowerCase();
                terms.forEach(term => {
                    if (titleLower.includes(term)) {
                        score += 10;
                        if (titleLower.startsWith(term)) {
                            score += 5;
                        }
                    }
                });

                // Skill match
                if (article.skill.toLowerCase().includes(query)) {
                    score += 3;
                }

                // Topic match
                if (article.topic.toLowerCase().includes(query)) {
                    score += 2;
                }

                return { ...article, score };
            })
            .filter(article => article.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    /**
     * Show search results
     * @param {Array} results
     */
    showResults(results) {
        this.results.textContent = '';
        this.activeIndex = -1;

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No articles found';
            this.results.appendChild(noResults);
        } else {
            results.forEach((article, index) => {
                const item = this.createResultItem(article, index);
                this.results.appendChild(item);
            });
        }

        this.open();
    }

    /**
     * Create a result item element
     * @param {Object} article
     * @param {number} index
     * @returns {HTMLElement}
     */
    createResultItem(article, index) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.dataset.index = index;

        const title = document.createElement('div');
        title.className = 'search-result-title';
        title.textContent = article.title;
        item.appendChild(title);

        const path = document.createElement('div');
        path.className = 'search-result-path';

        const skillSpan = document.createElement('span');
        skillSpan.textContent = article.skill;
        path.appendChild(skillSpan);
        path.appendChild(document.createTextNode(' / '));
        path.appendChild(document.createTextNode(article.topic));

        item.appendChild(path);

        // Click handler
        item.addEventListener('click', () => {
            const hashPath = router.buildPath(article.skillSlug, article.topicSlug, article.slug);
            router.navigate(hashPath);
            this.close();
            this.input.value = '';
            this.input.blur();
        });

        return item;
    }

    /**
     * Open results dropdown
     */
    open() {
        this.results.classList.add('active');
        this.isOpen = true;
    }

    /**
     * Close results dropdown
     */
    close() {
        this.results.classList.remove('active');
        this.isOpen = false;
        this.activeIndex = -1;
    }

    /**
     * Focus the search input
     */
    focus() {
        this.input.focus();
    }
}
