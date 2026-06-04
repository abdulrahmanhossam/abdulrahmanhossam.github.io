# AGENTS.md — Portfolio

This is a **pure static portfolio site** — no build tools, no package manager, no CI/CD.

## Site structure

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio page (hero, projects, experience, writing) |
| `blog.html` | Blog listing with stats |
| `article.html` | Renders a Markdown post via `?post=slug` query param |
| `posts/*.md` | Blog articles in Markdown (client-side rendered via `marked` CDN) |
| `images/` | Profile photo |
| `pdfs/` | CV PDF |

## How articles work

`article.html` loads `./posts/{slug}.md` using `fetch()` and renders it with `marked.parse()`. Add a new article by:
1. Creating `posts/my-article.md`
2. Adding a link to it in `blog.html` and optionally in `index.html`

No server-side processing — everything happens in the browser.

## Design system

Neo-brutalist style. CSS custom properties are defined in each HTML file's `<style>` block. All pages share the same design tokens but duplicate the CSS (no bundler). Keep styling consistent when editing.

## Commands

None. Open the HTML files directly in a browser to preview.
