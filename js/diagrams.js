'use strict';

(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs, parent) {
        const node = document.createElementNS(SVG_NS, tag);
        if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
                node.setAttribute(k, String(v));
            }
        }
        if (parent) parent.appendChild(node);
        return node;
    }

    function box(parent, x, y, w, h, label, highlight) {
        el('rect', {
            x, y, width: w, height: h, rx: 4,
            fill: highlight ? 'rgba(245,245,245,0.08)' : '#222222',
            stroke: highlight ? '#f5f5f5' : '#525252',
            'stroke-width': 1.25
        }, parent);
        const t = el('text', {
            x: x + w / 2,
            y: y + h / 2 + 5,
            fill: highlight ? '#f5f5f5' : '#d4d4d4',
            'text-anchor': 'middle',
            'font-size': 13
        }, parent);
        t.textContent = label;
    }

    function labelText(parent, x, y, text, color, size) {
        const t = el('text', {
            x, y,
            fill: color || '#a3a3a3',
            'text-anchor': 'middle',
            'font-size': size || 12
        }, parent);
        t.textContent = text;
    }

    function arrowRight(parent, x1, y, x2, color) {
        const g = el('g', { fill: 'none', stroke: color || '#f5f5f5', 'stroke-width': 1.5 }, parent);
        el('path', { d: `M${x1} ${y}H${x2}M${x2 - 5} ${y - 5}L${x2} ${y}L${x2 - 5} ${y + 5}` }, g);
    }

    function arrowDown(parent, x, y1, y2, color) {
        const g = el('g', { fill: 'none', stroke: color || '#f5f5f5', 'stroke-width': 1.5 }, parent);
        el('path', { d: `M${x} ${y1}V${y2}M${x - 5} ${y2 - 5}L${x} ${y2}L${x + 5} ${y2 - 5}` }, g);
    }

    function createDiagram(slug, ariaLabel, isFeature) {
        const svg = el('svg', {
            role: 'img',
            'aria-label': ariaLabel,
            viewBox: '0 0 320 180',
            width: 320,
            height: 180,
            fill: '#a3a3a3',
            focusable: 'false',
            class: isFeature ? 'diagram-feature' : 'project-row-diagram'
        });

        const g = el('g', { 'aria-hidden': 'true' }, svg);

        switch (slug) {
            case 'marsa': {
                box(g, 14, 40, 74, 38, 'git push', false);
                box(g, 114, 40, 86, 38, 'BuildKit', true);
                box(g, 226, 40, 80, 38, 'Caddy', false);
                arrowRight(g, 92, 59, 110);
                arrowRight(g, 204, 59, 222);
                box(g, 102, 116, 110, 36, 'health gate', false);
                const p = el('g', { fill: 'none', stroke: '#737373', 'stroke-width': 1.35 }, g);
                el('path', { d: 'M157 78V110M152 105L157 110L162 105' }, p);
                el('path', { d: 'M212 134H266V84M261 89L266 84L271 89', stroke: '#34d399' }, p);
                labelText(g, 250, 148, 'pass', '#34d399', 11);
                break;
            }
            case 'ruqa': {
                box(g, 14, 68, 72, 40, 'input', false);
                box(g, 110, 68, 92, 40, 'tiny-skia', true);
                box(g, 224, 68, 84, 40, 'surface', false);
                arrowRight(g, 90, 88, 106);
                arrowRight(g, 206, 88, 220);
                labelText(g, 156, 48, 'damage rect', '#a3a3a3', 12);
                labelText(g, 156, 134, '~34.2 MB RSS · offline', '#737373', 11);
                break;
            }
            case 'talebelm': {
                box(g, 22, 22, 276, 136, '', false);
                labelText(g, 160, 42, 'Api  ->  Application', '#a3a3a3', 12);
                box(g, 82, 58, 156, 42, 'Domain Core', true);
                labelText(g, 160, 128, 'EF Core · Codeforces · CI', '#a3a3a3', 12);
                arrowDown(g, 160, 47, 56, '#f5f5f5');
                const up = el('g', { fill: 'none', stroke: '#f5f5f5', 'stroke-width': 1.4 }, g);
                el('path', { d: 'M160 114V103M155 108L160 103L165 108' }, up);
                break;
            }
            case 'egypt-net': {
                box(g, 14, 68, 80, 40, '14-digit', false);
                box(g, 118, 68, 86, 40, 'Span<T>', true);
                box(g, 228, 22, 78, 34, 'Region', false);
                box(g, 228, 71, 78, 34, 'Age/Sex', false);
                box(g, 228, 120, 78, 34, 'Masked', false);
                arrowRight(g, 98, 88, 114);
                const br = el('g', { fill: 'none', stroke: '#f5f5f5', 'stroke-width': 1.4 }, g);
                el('path', { d: 'M204 88H216M216 39V137' }, br);
                arrowRight(g, 216, 39, 225);
                arrowRight(g, 216, 88, 225);
                arrowRight(g, 216, 137, 225);
                labelText(g, 161, 132, '2.13 us', '#737373', 11);
                break;
            }
            case 'user-activity-logger': {
                box(g, 16, 32, 86, 38, 'Action', false);
                box(g, 126, 32, 96, 38, 'Filter', true);
                box(g, 240, 32, 66, 38, 'HTTP', false);
                arrowRight(g, 106, 51, 122);
                arrowRight(g, 226, 51, 237);
                arrowDown(g, 174, 74, 108);
                box(g, 92, 112, 164, 38, 'DbContext Audit', false);
                labelText(g, 56, 136, 'redact', '#737373', 11);
                break;
            }
            case 'qget': {
                box(g, 16, 68, 66, 40, 'URL', false);
                box(g, 108, 68, 92, 40, 'qget (Go)', true);
                box(g, 224, 30, 82, 34, 'yt-dlp', false);
                box(g, 224, 73, 82, 34, 'Deno', false);
                box(g, 224, 116, 82, 34, 'FFmpeg', false);
                arrowRight(g, 86, 88, 104);
                const br = el('g', { fill: 'none', stroke: '#f5f5f5', 'stroke-width': 1.4 }, g);
                el('path', { d: 'M200 88H212M212 47V133' }, br);
                arrowRight(g, 212, 47, 221);
                arrowRight(g, 212, 90, 221);
                arrowRight(g, 212, 133, 221);
                break;
            }
            case 'tinygc': {
                box(g, 14, 36, 72, 38, 'Roots', false);
                box(g, 112, 36, 82, 38, 'Mark', true);
                box(g, 220, 36, 84, 38, 'Sweep', false);
                arrowRight(g, 90, 55, 108);
                arrowRight(g, 198, 55, 216);
                box(g, 84, 112, 152, 38, 'Heap / FreeList', false);
                const loop = el('g', { fill: 'none', stroke: '#737373', 'stroke-width': 1.4 }, g);
                el('path', { d: 'M262 78V131H240M245 126L240 131L245 136' }, loop);
                el('path', { d: 'M84 131H50V78M45 83L50 78L55 83' }, loop);
                break;
            }
            case 'kernel-simulator':
            default: {
                labelText(g, 52, 26, 'Ready', '#a3a3a3', 12);
                labelText(g, 52, 160, 'Aging +1', '#737373', 11);
                box(g, 18, 42, 68, 28, 'P1 · 3', false);
                box(g, 18, 78, 68, 28, 'P2 · 1', true);
                box(g, 18, 114, 68, 28, 'P3 · 4', false);
                box(g, 128, 64, 78, 44, 'CPU', true);
                box(g, 236, 64, 70, 44, 'I/O', false);
                arrowRight(g, 92, 92, 124);
                arrowRight(g, 210, 78, 232);
                const ret = el('g', { fill: 'none', stroke: '#737373', 'stroke-width': 1.4 }, g);
                el('path', { d: 'M271 112V138H92M97 133L92 138L97 143' }, ret);
                labelText(g, 167, 46, 'tick loop', '#a3a3a3', 11);
                break;
            }
        }

        return svg;
    }

    window.createProjectDiagram = createDiagram;
})();

