'use strict';

(function () {
    const DATA = window.PORTFOLIO_DATA;
    const SAVED_KEY = 'ah_saved_articles_v1';

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function svgIcon(paths, size) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', String(size || 14));
        svg.setAttribute('height', String(size || 14));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        for (const d of paths) {
            const p = document.createElementNS(svgNS, 'path');
            p.setAttribute('d', d);
            svg.appendChild(p);
        }
        return svg;
    }

    const ICONS = {
        arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
        arrowLeft: ['m12 19-7-7 7-7', 'M19 12H5'],
        arrowUpRight: ['M7 7h10v10', 'M7 17 17 7'],
        arrowDown: ['M12 5v14', 'm19 12-7 7-7-7']
    };

    function getSavedSlugs() {
        try {
            const raw = localStorage.getItem(SAVED_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            const allowed = new Set(DATA.posts.map(p => p.slug));
            return parsed.filter(s => typeof s === 'string' && allowed.has(s));
        } catch {
            return [];
        }
    }

    function setSavedSlugs(slugs) {
        try {
            localStorage.setItem(SAVED_KEY, JSON.stringify(slugs));
        } catch {
            // Storage unavailable; fail safely without throwing
        }
    }

    window.PORTFOLIO_SAVED = {
        get: getSavedSlugs,
        toggle(slug) {
            const allowed = new Set(DATA.posts.map(p => p.slug));
            if (!allowed.has(slug)) return false;
            const current = getSavedSlugs();
            const exists = current.includes(slug);
            const next = exists ? current.filter(s => s !== slug) : [...current, slug];
            setSavedSlugs(next);
            return !exists;
        },
        has(slug) {
            return getSavedSlugs().includes(slug);
        }
    };

    function renderHomeFeed() {
        const list = document.getElementById('home-feed-list');
        if (!list) return;
        list.replaceChildren();

        for (const item of DATA.homeFeed) {
            const li = el('li');
            const a = el('a', 'feed-row');

            if (item.type === 'article') {
                a.href = `article.html?post=${encodeURIComponent(item.slug)}`;
                const label = el('time', 'feed-label tabular-nums', item.date);
                const wrap = el('span', 'feed-title-wrap');
                wrap.appendChild(el('span', 'feed-title', item.title));
                a.append(label, wrap);
            } else {
                a.href = `project.html?slug=${encodeURIComponent(item.slug)}`;
                const label = el('span', 'feed-label', 'Case study');
                const wrap = el('span', 'feed-title-wrap');
                wrap.appendChild(el('span', 'feed-title', item.title));
                wrap.appendChild(el('span', 'feed-subtitle', ` — ${item.summary}`));
                a.append(label, wrap);
            }
            li.appendChild(a);
            list.appendChild(li);
        }
    }

    function renderProjectsPage() {
        const list = document.getElementById('projects-list');
        if (!list) return;
        list.replaceChildren();

        const countEl = document.getElementById('projects-count-label');
        if (countEl) {
            countEl.textContent = `SELECTED WORK · ${String(DATA.projects.length).padStart(2, '0')} PROJECTS`;
        }

        for (const p of DATA.projects) {
            const li = el('li', 'project-row');
            const article = el('article');
            article.setAttribute('aria-labelledby', `project-${p.slug}-title`);

            const grid = el('div', 'project-row-grid');
            const cat = el('p', 'project-row-category', p.category);

            const h2 = el('h2', 'project-row-title');
            h2.id = `project-${p.slug}-title`;
            const titleLink = el('a', '', p.title);
            titleLink.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
            h2.appendChild(titleLink);

            const desc = el('p', 'project-row-desc', p.summary);

            const tagsUl = el('ul', 'project-row-tags');
            tagsUl.setAttribute('aria-label', `${p.title} technologies`);
            for (const t of p.tags) {
                tagsUl.appendChild(el('li', '', t));
            }

            const diagram = window.createProjectDiagram(p.slug, `${p.title} architecture diagram`, false);

            grid.append(cat, h2, desc, tagsUl, diagram);
            article.appendChild(grid);

            const notesLink = el('a', 'project-notes-link');
            notesLink.href = `project.html?slug=${encodeURIComponent(p.slug)}#evidence`;
            notesLink.append(
                el('span', 'project-notes-label', 'Project notes'),
                el('span', 'project-notes-sep', '/'),
                el('span', '', p.evidenceNote)
            );
            article.appendChild(notesLink);

            const actions = el('div', 'project-actions');
            if (p.hasDemo) {
                const demoLink = el('a', 'text-link is-bright');
                demoLink.href = `project.html?slug=${encodeURIComponent(p.slug)}#demo`;
                demoLink.append(svgIcon(['M6 3l14 9-14 9V3z'], 13), el('span', '', 'Try demo'));
                actions.appendChild(demoLink);
            }

            const caseLink = el('a', 'text-link is-bright');
            caseLink.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
            caseLink.append(el('span', '', 'Read case study'), svgIcon(ICONS.arrowRight, 14));
            actions.appendChild(caseLink);

            const ghLink = el('a', 'text-link');
            ghLink.href = p.githubUrl;
            ghLink.target = '_blank';
            ghLink.rel = 'noopener noreferrer';
            ghLink.append(el('span', '', 'GitHub'), svgIcon(ICONS.arrowUpRight, 14));
            actions.appendChild(ghLink);

            if (p.nugetUrl) {
                const nugetLink = el('a', 'text-link');
                nugetLink.href = p.nugetUrl;
                nugetLink.target = '_blank';
                nugetLink.rel = 'noopener noreferrer';
                nugetLink.append(el('span', '', 'NuGet'), svgIcon(ICONS.arrowUpRight, 14));
                actions.appendChild(nugetLink);
            }

            article.appendChild(actions);
            li.appendChild(article);
            list.appendChild(li);
        }
    }

    function renderCaseStudyPage() {
        const container = document.getElementById('case-study-root');
        if (!container) return;

        const params = new URLSearchParams(window.location.search);
        const requested = params.get('slug') || 'marsa';
        const project = DATA.projects.find(p => p.slug === requested) || DATA.projects[0];

        document.title = `${project.title} — Case Study | Abdulrahman Hossam`;
        container.replaceChildren();

        // Top intro block
        const top = el('div');
        const back = el('a', 'text-link');
        back.href = 'projects.html';
        back.style.marginBottom = '1.25rem';
        back.append(svgIcon(ICONS.arrowLeft, 14), el('span', '', 'All projects'));

        const eyebrow = el('p', 'section-heading', 'Project case study');
        const h1 = el('h1', 'page-title', project.title);
        h1.id = 'project-title';
        h1.style.marginTop = '0.75rem';

        const subtitle = el('p', 'lead-copy', project.subtitle);
        subtitle.style.marginTop = '0.5rem';

        const lead = el('p', 'page-description', project.summary);
        lead.style.marginTop = '1.1rem';

        const tagsUl = el('ul', 'project-row-tags');
        tagsUl.style.marginTop = '1rem';
        for (const t of project.tags) {
            tagsUl.appendChild(el('li', '', t));
        }

        const linksRow = el('div', 'project-actions');
        linksRow.style.marginTop = '1.25rem';
        const gh = el('a', 'text-link is-bright');
        gh.href = project.githubUrl;
        gh.target = '_blank';
        gh.rel = 'noopener noreferrer';
        gh.append(el('span', '', 'GitHub'), svgIcon(ICONS.arrowUpRight, 14));
        linksRow.appendChild(gh);

        if (project.nugetUrl) {
            const nu = el('a', 'text-link is-bright');
            nu.href = project.nugetUrl;
            nu.target = '_blank';
            nu.rel = 'noopener noreferrer';
            nu.append(el('span', '', 'NuGet Package'), svgIcon(ICONS.arrowUpRight, 14));
            linksRow.appendChild(nu);
        }

        const notesBanner = el('a', 'case-notes-banner');
        notesBanner.href = '#evidence';
        const notesText = el('span');
        notesText.append(el('span', 'case-notes-tag', 'Project notes'), el('span', '', project.evidenceNote));
        notesBanner.append(notesText, svgIcon(ICONS.arrowDown, 14));

        top.append(back, eyebrow, h1, subtitle, lead, tagsUl, linksRow, notesBanner);
        container.appendChild(top);

        // Problem section
        const probSec = el('section');
        const probTitle = el('h2', 'section-heading', 'The problem');
        probTitle.style.marginBottom = '1rem';
        probSec.append(probTitle, el('p', 'body-copy', project.problem));
        container.appendChild(probSec);

        // Architecture section
        const archSec = el('section');
        const archTitle = el('h2', 'section-heading', 'How it fits together');
        archTitle.style.marginBottom = '1.25rem';
        archSec.appendChild(archTitle);
        archSec.appendChild(window.createProjectDiagram(project.slug, `${project.title} system architecture`, true));

        const stepsGrid = el('div', 'steps-grid');
        for (const step of project.architectureSteps) {
            const card = el('div', 'step-card');
            card.append(
                el('div', 'step-num', step.num),
                el('h3', 'step-title', step.title),
                el('p', 'step-desc', step.desc)
            );
            stepsGrid.appendChild(card);
        }
        archSec.appendChild(stepsGrid);
        archSec.appendChild(el('p', 'body-copy', project.architectureSummary));
        container.appendChild(archSec);

        // Interactive demo section if applicable
        if (project.hasDemo && window.mountProjectDemo) {
            const demoSec = el('section');
            demoSec.id = 'demo';
            const demoTitle = el('h2', 'section-heading', 'Interactive browser demo');
            demoTitle.style.marginBottom = '1rem';
            demoSec.appendChild(demoTitle);
            window.mountProjectDemo(project.demoType, demoSec);
            container.appendChild(demoSec);
        }

        // Decisions & Tradeoffs
        const decSec = el('section');
        const decTitle = el('h2', 'section-heading', 'Decisions & tradeoffs');
        decTitle.style.marginBottom = '1rem';
        decSec.appendChild(decTitle);
        const decList = el('div', 'decisions-list');
        for (const d of project.decisions) {
            const item = el('div');
            item.append(el('h3', 'item-title', d.title));
            const p = el('p', 'body-copy', d.body);
            p.style.marginTop = '0.45rem';
            item.appendChild(p);
            decList.appendChild(item);
        }
        decSec.appendChild(decList);
        container.appendChild(decSec);

        // Tests & limitations
        const evSec = el('section');
        evSec.id = 'evidence';
        const evTitle = el('h2', 'section-heading', 'Tests and limitations');
        evTitle.style.marginBottom = '1rem';
        evSec.appendChild(evTitle);

        const evBody = el('div', 'stack-sm');
        for (const paragraph of project.testsAndLimitations) {
            evBody.appendChild(el('p', 'body-copy', paragraph));
        }
        evSec.appendChild(evBody);

        const refUl = el('ul', 'ref-links');
        for (const r of project.references) {
            const li = el('li');
            const a = el('a', 'text-link');
            a.href = r.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.append(el('span', '', r.label), svgIcon(ICONS.arrowUpRight, 13));
            li.appendChild(a);
            refUl.appendChild(li);
        }
        evSec.appendChild(refUl);
        container.appendChild(evSec);

        // Local commands
        const runSec = el('section');
        const runTitle = el('h2', 'section-heading', 'Running locally');
        runTitle.style.marginBottom = '0.5rem';
        const pre = el('pre', 'code-terminal');
        const code = el('code', '', project.localCommands.join('\n'));
        pre.appendChild(code);
        runSec.append(runTitle, pre);
        container.appendChild(runSec);
    }

    function renderBlogPage() {
        const list = document.getElementById('blog-articles-list');
        if (!list) return;
        list.replaceChildren();

        for (const post of DATA.posts) {
            const li = el('li');
            const a = el('a', 'article-list-link');
            a.href = `article.html?post=${encodeURIComponent(post.slug)}`;

            const meta = el('div', 'article-list-meta');
            const timeEl = el('time', 'tabular-nums', post.date);
            timeEl.dateTime = post.isoDate;
            meta.append(timeEl, el('span', 'meta-dot', '·'), el('span', '', post.readTime));

            const body = el('div');
            body.append(
                el('h2', 'article-list-title', post.title),
                el('p', 'article-list-desc', post.description)
            );

            a.append(meta, body);
            li.appendChild(a);
            list.appendChild(li);
        }

        setupBlogDialogs();
    }

    function setupBlogDialogs() {
        const pathsBtn = document.getElementById('open-reading-paths');
        const savedBtn = document.getElementById('open-saved-articles');
        const glossaryBtn = document.getElementById('open-glossary');

        const dialog = document.getElementById('utility-dialog');
        const dialogTitle = document.getElementById('utility-dialog-title');
        const dialogBody = document.getElementById('utility-dialog-body');
        const closeBtn = document.getElementById('utility-dialog-close');

        if (!dialog || !dialogTitle || !dialogBody) return;

        function openDialog(title, renderFn) {
            dialogTitle.textContent = title;
            dialogBody.replaceChildren();
            renderFn(dialogBody);
            dialog.showModal();
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => dialog.close());
        }
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });

        if (pathsBtn) {
            pathsBtn.addEventListener('click', () => {
                openDialog('Reading paths', (root) => {
                    for (const path of DATA.readingPaths) {
                        const card = el('div', 'dialog-row');
                        card.append(el('h3', 'item-title', path.title));
                        const desc = el('p', 'body-copy', path.description);
                        desc.style.margin = '0.35rem 0 0.6rem';
                        card.appendChild(desc);

                        const ul = el('ol');
                        ul.style.paddingLeft = '1.2rem';
                        ul.style.color = '#d4d4d4';
                        for (const slug of path.slugs) {
                            const post = DATA.posts.find(p => p.slug === slug);
                            if (!post) continue;
                            const li = el('li');
                            li.style.marginBottom = '0.25rem';
                            const link = el('a', 'inline-link', post.title);
                            link.href = `article.html?post=${encodeURIComponent(post.slug)}`;
                            li.appendChild(link);
                            ul.appendChild(li);
                        }
                        card.appendChild(ul);
                        root.appendChild(card);
                    }
                });
            });
        }

        if (savedBtn) {
            savedBtn.addEventListener('click', () => {
                openDialog('Saved articles', (root) => {
                    const saved = getSavedSlugs();
                    if (saved.length === 0) {
                        root.appendChild(el('p', 'body-copy', 'No saved articles yet. Open any article and click "Save article" to bookmark it locally in your browser.'));
                        return;
                    }
                    for (const slug of saved) {
                        const post = DATA.posts.find(p => p.slug === slug);
                        if (!post) continue;
                        const row = el('a', 'dialog-row');
                        row.href = `article.html?post=${encodeURIComponent(post.slug)}`;
                        row.append(
                            el('div', 'item-title', post.title),
                            el('div', 'meta-text', `${post.date} · ${post.readTime}`)
                        );
                        root.appendChild(row);
                    }
                });
            });
        }

        if (glossaryBtn) {
            glossaryBtn.addEventListener('click', () => {
                openDialog('Systems & .NET Glossary', (root) => {
                    for (const g of DATA.glossary) {
                        const row = el('div', 'dialog-row');
                        row.append(el('div', 'item-title', g.term));
                        const def = el('p', 'body-copy', g.def);
                        def.style.marginTop = '0.25rem';
                        row.appendChild(def);
                        root.appendChild(row);
                    }
                });
            });
        }
    }

    function renderAskPage() {
        const list = document.getElementById('faq-list');
        if (!list) return;
        list.replaceChildren();

        DATA.faq.forEach((item, idx) => {
            const details = el('details', 'faq-item');
            if (idx === 0) details.open = true;
            const summary = el('summary');
            summary.append(
                el('span', '', item.q),
                svgIcon(['m6 9 6 6 6-6'], 14)
            );
            const ans = el('div', 'faq-answer', item.a);
            details.append(summary, ans);
            list.appendChild(details);
        });

        const copyBtn = document.getElementById('copy-email-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(DATA.profile.email).then(() => {
                        copyBtn.textContent = 'Copied ahossam.tech@gmail.com';
                        setTimeout(() => { copyBtn.textContent = 'Copy email address'; }, 2200);
                    }).catch(() => {});
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderHomeFeed();
        renderProjectsPage();
        renderCaseStudyPage();
        renderBlogPage();
        renderAskPage();
    });
})();

