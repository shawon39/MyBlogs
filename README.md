# MyBlogs

A clean, modern static site for organizing and sharing developer knowledge base articles with built-in search, syntax highlighting, and responsive design.

## Features

- **Organized Content**: Hierarchical structure (Skills → Topics → Articles)
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Full-Text Search**: Fast client-side search across all articles
- **Table of Contents**: Auto-generated TOC for easy navigation
- **Keyboard Shortcuts**:
  - `T` - Toggle theme
  - `B` - Toggle sidebar
  - `/` - Focus search
- **Markdown Support**: Full markdown with syntax highlighting
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- Vanilla JavaScript (no framework dependencies)
- [Marked.js](https://marked.js.org/) - Markdown rendering
- [Highlight.js](https://highlightjs.org/) - Code syntax highlighting
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- Hash-based client-side routing

## Project Structure

```
MyBlogs/
├── index.html              # Main entry point
├── favicon.svg             # Site favicon
├── content/                # Article content
│   ├── manifest.json       # Auto-generated navigation (do not edit manually)
│   └── [Skill]/            # Skill folders (e.g., Salesforce, Frontend)
│       └── [Topic]/        # Topic folders (e.g., Admin, JavaScript)
│           ├── _meta.json  # Optional metadata
│           └── *.md        # Article markdown files
├── scripts/
│   ├── app.js              # Main application
│   ├── navigation.js       # Navigation tree logic
│   ├── router.js           # Hash-based routing
│   ├── markdown.js         # Markdown rendering
│   ├── search.js           # Search functionality
│   └── toc.js              # Table of contents
├── styles/
│   └── main.css            # All styles
└── build.js                # Manifest generator script
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MyBlogs
   ```

2. **Generate navigation manifest**
   ```bash
   node build.js
   ```

3. **Start a local web server**

   Choose one:
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js
   npx http-server

   # VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

> **Note**: Do not open `index.html` directly in the browser (file:// protocol) as it will fail due to CORS restrictions. Always use a local web server.

## Adding Content

1. **Create folder structure**
   ```bash
   mkdir -p content/YourSkill/YourTopic
   ```

2. **Add markdown file**
   ```bash
   touch content/YourSkill/YourTopic/your-article.md
   ```

3. **Write content** (example):
   ```markdown
   # Your Article Title

   Article content goes here with **markdown** formatting.

   ## Code Examples

   \`\`\`javascript
   console.log('Hello, World!');
   \`\`\`
   ```

4. **Optional: Add metadata**

   Create `_meta.json` in skill/topic folders:
   ```json
   {
     "name": "Display Name",
     "order": 1
   }
   ```

5. **Regenerate manifest**
   ```bash
   node build.js
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Add new article"
   git push
   ```

## Deployment

### GitHub Pages

1. Push to your repository
2. Go to **Settings** → **Pages**
3. Set source to `main` branch
4. Site will be available at `https://shawon39.github.io/MyBlogs/`

The `.nojekyll` file ensures GitHub Pages serves all files correctly without Jekyll processing.

## License

This project is open source and available under the MIT License.
