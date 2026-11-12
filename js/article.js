'use strict';

(function () {
    const DATA = window.PORTFOLIO_DATA;
    const TEXT_SIZE_KEY = 'ah_blog_text_size_v1';

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function slugifyHeading(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    function setupTextSize(proseEl) {
        const buttons = document.querySelectorAll('[data-text-size]');
        function applySize(val) {
            const pct = ['80', '100', '125'].includes(val) ? val : '100';
            proseEl.style.setProperty('--blog-text-size', pct);
            buttons.forEach(btn => {
                const active = btn.getAttribute('data-text-size') === pct;
                btn.classList.toggle('is-active', active);
                btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            try {
                localStorage.setItem(TEXT_SIZE_KEY, pct);
            } catch {
                // Ignore storage errors
            }
        }

        let initial = '100';
        try {
            initial = localStorage.getItem(TEXT_SIZE_KEY) || '100';
        } catch {
            initial = '100';
        }
        applySize(initial);

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                applySize(btn.getAttribute('data-text-size'));
            });
        });
    }

    function setupSaveButton(slug) {
        const btn = document.getElementById('save-article-btn');
        const label = document.getElementById('save-article-label');
        if (!btn || !label || !window.PORTFOLIO_SAVED) return;

        function refresh() {
            const saved = window.PORTFOLIO_SAVED.has(slug);
            btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
            label.textContent = saved ? 'Saved' : 'Save article';
        }

        btn.addEventListener('click', () => {
            window.PORTFOLIO_SAVED.toggle(slug);
            refresh();
        });
        refresh();
    }

    function enhanceCodeBlocks(proseEl) {
        const pres = Array.from(proseEl.querySelectorAll('pre'));
        for (const pre of pres) {
            if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrap')) continue;

            const code = pre.querySelector('code');
            let lang = 'text';
            if (code) {
                for (const cls of code.classList) {
                    if (cls.startsWith('language-')) {
                        lang = cls.slice('language-'.length) || 'text';
                        break;
                    }
                }
            }

            const wrap = el('div', 'code-block-wrap');
            const header = el('div', 'code-block-header');
            header.appendChild(el('span', '', lang));

            const copyBtn = el('button', 'code-copy-btn', 'Copy');
            copyBtn.type = 'button';
            copyBtn.addEventListener('click', () => {
                const text = code ? code.textContent : pre.textContent;
                if (navigator.clipboard && text) {
                    navigator.clipboard.writeText(text).then(() => {
                        copyBtn.textContent = 'Copied';
                        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1600);
                    }).catch(() => {});
                }
            });
            header.appendChild(copyBtn);

            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(header);
            wrap.appendChild(pre);
        }
    }

    function buildToc(proseEl) {
        const desktopList = document.getElementById('toc-desktop-list');
        const mobileList = document.getElementById('toc-mobile-list');
        if (!desktopList || !mobileList) return;

        desktopList.replaceChildren();
        mobileList.replaceChildren();

        const headings = Array.from(proseEl.querySelectorAll('h2, h3'));
        const usedIds = new Set();
        const sections = [];

        for (const h of headings) {
            let id = slugifyHeading(h.textContent) || 'section';
            let counter = 2;
            while (usedIds.has(id)) {
                id = `${id}-${counter++}`;
            }
            usedIds.add(id);
            h.id = id;

            if (h.tagName === 'H2') {
                sections.push({ id, title: h.textContent, el: h, children: [] });
            } else if (sections.length > 0) {
                sections[sections.length - 1].children.push({ id, title: h.textContent, el: h });
            } else {
                sections.push({ id, title: h.textContent, el: h, children: [] });
            }
        }

        function populate(targetList) {
            for (const sec of sections) {
                const li = el('li');
                const a = el('a', 'toc-link', sec.title);
                a.href = `#${sec.id}`;
                a.setAttribute('data-toc-id', sec.id);
                li.appendChild(a);

                if (sec.children.length > 0) {
                    const sub = el('ol', 'toc-sublist');
                    for (const ch of sec.children) {
                        const subLi = el('li');
                        const subA = el('a', 'toc-link', ch.title);
                        subA.href = `#${ch.id}`;
                        subA.setAttribute('data-toc-id', ch.id);
                        subLi.appendChild(subA);
                        sub.appendChild(subLi);
                    }
                    li.appendChild(sub);
                }
                targetList.appendChild(li);
            }
        }

        populate(desktopList);
        populate(mobileList);

        // Close mobile TOC when clicking a link
        const mobileDetails = document.getElementById('toc-mobile-details');
        mobileList.addEventListener('click', (e) => {
            if (e.target.closest('a') && mobileDetails) {
                mobileDetails.open = false;
            }
        });

        // Scroll spy
        if ('IntersectionObserver' in window && headings.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const activeId = entry.target.id;
                        document.querySelectorAll('.toc-link').forEach(link => {
                            link.classList.toggle('is-active', link.getAttribute('data-toc-id') === activeId);
                        });
                    }
                }
            }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

            headings.forEach(h => observer.observe(h));
        }
    }

    function setupSearchDialog() {
        const openBtn = document.getElementById('open-search-btn');
        const dialog = document.getElementById('search-dialog');
        const closeBtn = document.getElementById('search-close-btn');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');

        if (!openBtn || !dialog || !input || !results) return;

        let cachedIndex = null;

        async function loadIndex() {
            if (cachedIndex) return cachedIndex;
            const entries = [];
            for (const post of DATA.posts) {
                try {
                    const resp = await fetch(`./posts/${post.slug}.md`);
                    if (!resp.ok) continue;
                    const md = await resp.text();
                    const lines = md.split('\n');
                    let currentSection = post.title;
                    let buffer = [];
                    for (const line of lines) {
                        const m = line.match(/^#{2,3}\s+(.+)$/);
                        if (m) {
                            if (buffer.length > 0) {
                                entries.push({
                                    slug: post.slug,
                                    postTitle: post.title,
                                    section: currentSection,
                                    headingId: slugifyHeading(currentSection),
                                    text: buffer.join(' ')
                                });
                            }
                            currentSection = m[1].trim();
                            buffer = [];
                        } else {
                            buffer.push(line.replace(/[`*_#>\[\]()]/g, ' ').trim());
                        }
                    }
                    if (buffer.length > 0) {
                        entries.push({
                            slug: post.slug,
                            postTitle: post.title,
                            section: currentSection,
                            headingId: slugifyHeading(currentSection),
                            text: buffer.join(' ')
                        });
                    }
                } catch {
                    // Ignore fetch error for individual post
                }
            }
            cachedIndex = entries;
            return entries;
        }

        function renderResults(query, index) {
            results.replaceChildren();
            const q = query.trim().toLowerCase();
            if (!q) {
                results.appendChild(el('p', 'body-copy', 'Search across all articles and jump directly to a matching section. Try "Mark-Sweep", "Span", "Controller", or "LOH".'));
                return;
            }
            const matches = index.filter(item =>
                item.postTitle.toLowerCase().includes(q) ||
                item.section.toLowerCase().includes(q) ||
                item.text.toLowerCase().includes(q)
            ).slice(0, 12);

            if (matches.length === 0) {
                results.appendChild(el('p', 'body-copy', 'No matching article sections found.'));
                return;
            }

            for (const m of matches) {
                const a = el('a', 'dialog-row');
                const hash = m.headingId ? `#${encodeURIComponent(m.headingId)}` : '';
                a.href = `article.html?post=${encodeURIComponent(m.slug)}${hash}`;
                a.append(
                    el('div', 'item-title', m.section),
                    el('div', 'meta-text', m.postTitle)
                );
                results.appendChild(a);
            }
        }

        openBtn.addEventListener('click', async () => {
            dialog.showModal();
            input.focus();
            const index = await loadIndex();
            renderResults(input.value, index);
        });

        input.addEventListener('input', async () => {
            const index = await loadIndex();
            renderResults(input.value, index);
        });

        if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });
    }

    async function loadArticle() {
        const contentEl = document.getElementById('content');
        if (!contentEl) return;

        const params = new URLSearchParams(window.location.search);
        const requested = params.get('post') || DATA.posts[0].slug;

        // Strict allow-list validation prevents path traversal or arbitrary URL fetch
        const meta = DATA.posts.find(p => p.slug === requested);
        if (!meta) {
            document.title = 'Article not found | Abdulrahman Hossam';
            contentEl.replaceChildren(
                el('h2', '', 'Article not found'),
                el('p', '', 'The requested article does not exist.')
            );
            return;
        }

        document.title = `${meta.title} | Abdulrahman Hossam`;

        const titleEl = document.getElementById('article-title');
        const descEl = document.getElementById('article-description');
        const dateEl = document.getElementById('article-date');
        const readEl = document.getElementById('article-readtime');
        if (titleEl) titleEl.textContent = meta.title;
        if (descEl) descEl.textContent = meta.description;
        if (dateEl) {
            dateEl.textContent = meta.date;
            dateEl.dateTime = meta.isoDate;
        }
        if (readEl) readEl.textContent = meta.readTime;

        setupTextSize(contentEl);
        setupSaveButton(meta.slug);
        setupSearchDialog();

        try {
            const resp = await fetch(`./posts/${meta.slug}.md`);
            if (!resp.ok) throw new Error('Not found');
            const markdown = await resp.text();

            const rawHtml = window.marked.parse(markdown);
            const cleanHtml = window.DOMPurify.sanitize(rawHtml, {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form'],
                FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
            });

            // Safe DOM insertion without assigning innerHTML
            const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
            contentEl.replaceChildren(...Array.from(doc.body.childNodes));

            // Make external links safe
            contentEl.querySelectorAll('a[href^="http"]').forEach(a => {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            });

            enhanceCodeBlocks(contentEl);
            buildToc(contentEl);
        } catch {
            contentEl.replaceChildren(
                el('h2', '', 'Failed to load article'),
                el('p', '', 'Please try refreshing the page.')
            );
        }
    }

    document.addEventListener('DOMContentLoaded', loadArticle);
})();

