/**
 * App - Main application entry point
 * Initializes all components and handles global interactions
 */

class App {
    constructor() {
        // Components
        this.navigation = null;
        this.markdown = null;
        this.toc = null;
        this.search = null;

        // DOM elements
        this.themeToggle = document.getElementById('themeToggle');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarLeft = document.getElementById('sidebarLeft');
        this.overlay = document.getElementById('overlay');

        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        // Load saved theme
        this.loadTheme();

        // Initialize components
        this.navigation = new Navigation('#navTree');
        this.markdown = new MarkdownRenderer('#mainContent');
        this.toc = new TableOfContents('#tableOfContents');
        this.search = new Search('#searchInput', '#searchResults');

        // Set up markdown render callback for TOC
        this.markdown.onRender = (contentElement) => {
            this.toc.generate(contentElement);
        };

        // Initialize TOC scroll spy
        this.toc.init();

        // Load navigation
        await this.navigation.init();

        // Set up search with articles
        this.search.setArticles(this.navigation.getAllArticles());

        // Set up router
        router.onRouteChange = (route) => this.handleRouteChange(route);

        // Set up event listeners
        this.setupEventListeners();

        // Handle initial route
        router.handleRoute();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Mobile menu toggle
        this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        this.overlay.addEventListener('click', () => this.closeMobileMenu());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle route changes
     * @param {Object} route
     */
    handleRouteChange(route) {
        // Update navigation active state
        this.navigation.updateActiveState();

        // Load article if path is complete
        if (route.skill && route.topic && route.article) {
            const articlePath = this.navigation.getArticlePath(route.skill, route.topic, route.article);
            if (articlePath) {
                this.markdown.load(articlePath);
                this.closeMobileMenu();
            } else {
                this.markdown.renderError();
            }
        } else {
            this.markdown.renderWelcome();
        }

        // Scroll to top on route change
        window.scrollTo(0, 0);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update highlight.js theme
        this.updateHighlightTheme(newTheme);
    }

    /**
     * Load saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', theme);
        this.updateHighlightTheme(theme);
    }

    /**
     * Update highlight.js theme based on app theme
     * @param {string} theme
     */
    updateHighlightTheme(theme) {
        const hljsLink = document.getElementById('hljs-theme');
        if (hljsLink) {
            const hljsTheme = theme === 'dark' ? 'github-dark' : 'github';
            hljsLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hljsTheme}.min.css`;
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.sidebarLeft.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.sidebarLeft.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.sidebarLeft.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Toggle sidebar (works on both mobile and desktop)
     */
    toggleSidebar() {
        if (window.innerWidth <= 900) {
            this.toggleMobileMenu();
        } else {
            this.toggleDesktopSidebar();
        }
    }

    /**
     * Toggle desktop sidebar
     */
    toggleDesktopSidebar() {
        this.sidebarLeft.classList.toggle('collapsed');
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e
     */
    handleKeydown(e) {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key.toLowerCase()) {
            case 't':
                // Toggle theme
                this.toggleTheme();
                break;

            case 'b':
                // Toggle sidebar
                this.toggleSidebar();
                break;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 900) {
            this.closeMobileMenu();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
