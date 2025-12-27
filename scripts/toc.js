/**
 * TableOfContents - Generates and manages the right sidebar TOC
 * Auto-generates from headings with scroll spy highlighting
 */

class TableOfContents {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.headings = [];
        this.links = [];
        this.activeIndex = -1;
        this.scrollTimeout = null;

        // Bind scroll handler
        this.handleScroll = this.handleScroll.bind(this);
    }

    /**
     * Initialize scroll spy
     */
    init() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    /**
     * Generate TOC from article content
     * @param {HTMLElement} contentElement - The article content container
     */
    generate(contentElement) {
        // Clear previous
        this.container.textContent = '';
        this.headings = [];
        this.links = [];
        this.activeIndex = -1;

        if (!contentElement) {
            this.renderEmpty();
            return;
        }

        // Find all headings
        const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4');

        if (headingElements.length === 0) {
            this.renderEmpty();
            return;
        }

        // Create TOC list
        const ul = document.createElement('ul');
        ul.className = 'toc-list';

        headingElements.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const id = heading.id || this.generateId(heading.textContent, index);
            const text = heading.textContent;

            // Ensure heading has an ID
            if (!heading.id) {
                heading.id = id;
            }

            // Store heading reference
            this.headings.push({
                element: heading,
                id: id,
                level: level
            });

            // Create TOC item
            const li = document.createElement('li');
            li.className = 'toc-item';

            const link = document.createElement('a');
            link.className = `toc-link toc-h${level}`;
            link.href = `#${id}`;
            link.textContent = text;

            // Smooth scroll on click
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToHeading(id);
            });

            this.links.push(link);

            li.appendChild(link);
            ul.appendChild(li);
        });

        this.container.appendChild(ul);

        // Initial scroll spy update
        this.handleScroll();
    }

    /**
     * Generate an ID from text
     * @param {string} text
     * @param {number} index
     * @returns {string}
     */
    generateId(text, index) {
        const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        return slug || `heading-${index}`;
    }

    /**
     * Scroll to a heading
     * @param {string} id
     */
    scrollToHeading(id) {
        const element = document.getElementById(id);
        if (!element) return;

        const headerHeight = 60; // Match header height
        const offset = 20;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Update URL hash without jumping
        history.pushState(null, '', `#${id}`);
    }

    /**
     * Handle scroll for scroll spy
     */
    handleScroll() {
        if (this.headings.length === 0) return;

        // Debounce for performance
        if (this.scrollTimeout) {
            cancelAnimationFrame(this.scrollTimeout);
        }

        this.scrollTimeout = requestAnimationFrame(() => {
            this.updateActiveHeading();
        });
    }

    /**
     * Update active heading based on scroll position
     */
    updateActiveHeading() {
        const headerHeight = 60;
        const offset = 100;
        const scrollY = window.scrollY + headerHeight + offset;

        let activeIndex = -1;

        // Find the current active heading
        for (let i = this.headings.length - 1; i >= 0; i--) {
            const heading = this.headings[i];
            const rect = heading.element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;

            if (scrollY >= elementTop) {
                activeIndex = i;
                break;
            }
        }

        // Update if changed
        if (activeIndex !== this.activeIndex) {
            // Remove previous active
            if (this.activeIndex >= 0 && this.links[this.activeIndex]) {
                this.links[this.activeIndex].classList.remove('active');
            }

            // Add new active
            if (activeIndex >= 0 && this.links[activeIndex]) {
                this.links[activeIndex].classList.add('active');

                // Scroll TOC to keep active item visible
                this.scrollTocToActive(this.links[activeIndex]);
            }

            this.activeIndex = activeIndex;
        }
    }

    /**
     * Scroll TOC container to keep active link visible
     * @param {HTMLElement} activeLink
     */
    scrollTocToActive(activeLink) {
        const container = this.container;
        const containerRect = container.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        const linkTop = linkRect.top - containerRect.top;
        const linkBottom = linkRect.bottom - containerRect.top;

        if (linkTop < 0) {
            container.scrollTop += linkTop - 20;
        } else if (linkBottom > containerRect.height) {
            container.scrollTop += linkBottom - containerRect.height + 20;
        }
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        this.container.textContent = '';

        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.style.padding = '2rem 1rem';

        const p = document.createElement('p');
        p.textContent = 'No headings found';
        p.style.fontSize = '0.75rem';
        empty.appendChild(p);

        this.container.appendChild(empty);
    }

    /**
     * Clear TOC
     */
    clear() {
        this.container.textContent = '';
        this.headings = [];
        this.links = [];
        this.activeIndex = -1;
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        if (this.scrollTimeout) {
            cancelAnimationFrame(this.scrollTimeout);
        }
        this.clear();
    }
}
