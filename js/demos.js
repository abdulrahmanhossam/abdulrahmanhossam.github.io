'use strict';

(function () {
    const GOVERNORATES = {
        '01': { en: 'Cairo', ar: 'القاهرة', region: 'Greater Cairo', coastal: false, upper: false },
        '02': { en: 'Alexandria', ar: 'الإسكندرية', region: 'Delta', coastal: true, upper: false },
        '03': { en: 'Port Said', ar: 'بورسعيد', region: 'Canal', coastal: true, upper: false },
        '04': { en: 'Suez', ar: 'السويس', region: 'Canal', coastal: true, upper: false },
        '11': { en: 'Damietta', ar: 'دمياط', region: 'Delta', coastal: true, upper: false },
        '12': { en: 'Dakahlia', ar: 'الدقهلية', region: 'Delta', coastal: false, upper: false },
        '13': { en: 'Sharqia', ar: 'الشرقية', region: 'Delta', coastal: false, upper: false },
        '14': { en: 'Qalyubia', ar: 'القليوبية', region: 'Greater Cairo', coastal: false, upper: false },
        '15': { en: 'Kafr El Sheikh', ar: 'كفر الشيخ', region: 'Delta', coastal: true, upper: false },
        '16': { en: 'Gharbia', ar: 'الغربية', region: 'Delta', coastal: false, upper: false },
        '17': { en: 'Monufia', ar: 'المنوفية', region: 'Delta', coastal: false, upper: false },
        '18': { en: 'Beheira', ar: 'البحيرة', region: 'Delta', coastal: true, upper: false },
        '19': { en: 'Ismailia', ar: 'الإسماعيلية', region: 'Canal', coastal: false, upper: false },
        '21': { en: 'Giza', ar: 'الجيزة', region: 'Greater Cairo', coastal: false, upper: false },
        '22': { en: 'Beni Suef', ar: 'بني سويف', region: 'Upper Egypt', coastal: false, upper: true },
        '23': { en: 'Fayoum', ar: 'الفيوم', region: 'Upper Egypt', coastal: false, upper: true },
        '24': { en: 'Minya', ar: 'المنيا', region: 'Upper Egypt', coastal: false, upper: true },
        '25': { en: 'Asyut', ar: 'أسيوط', region: 'Upper Egypt', coastal: false, upper: true },
        '26': { en: 'Sohag', ar: 'سوهاج', region: 'Upper Egypt', coastal: false, upper: true },
        '27': { en: 'Qena', ar: 'قنا', region: 'Upper Egypt', coastal: false, upper: true },
        '28': { en: 'Aswan', ar: 'أسوان', region: 'Upper Egypt', coastal: false, upper: true },
        '29': { en: 'Luxor', ar: 'الأقصر', region: 'Upper Egypt', coastal: false, upper: true },
        '31': { en: 'Red Sea', ar: 'البحر الأحمر', region: 'Sinai & Red Sea', coastal: true, upper: false },
        '32': { en: 'New Valley', ar: 'الوادي الجديد', region: 'Western Desert', coastal: false, upper: false },
        '33': { en: 'Matrouh', ar: 'مطروح', region: 'Western Desert', coastal: true, upper: false },
        '34': { en: 'North Sinai', ar: 'شمال سيناء', region: 'Sinai & Red Sea', coastal: true, upper: false },
        '35': { en: 'South Sinai', ar: 'جنوب سيناء', region: 'Sinai & Red Sea', coastal: true, upper: false },
        '88': { en: 'Born Abroad', ar: 'خارج الجمهورية', region: 'Foreign', coastal: false, upper: false }
    };

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function parseEgyptianId(raw) {
        const id = String(raw || '').trim();
        if (!/^\d{14}$/.test(id)) {
            return { ok: false, error: 'National ID must be exactly 14 numeric digits.' };
        }
        const centuryDigit = id[0];
        if (centuryDigit !== '2' && centuryDigit !== '3') {
            return { ok: false, error: 'Century digit must be 2 (1900s) or 3 (2000s).' };
        }
        const year = (centuryDigit === '2' ? 1900 : 2000) + Number(id.slice(1, 3));
        const month = Number(id.slice(3, 5));
        const day = Number(id.slice(5, 7));

        const dt = new Date(Date.UTC(year, month - 1, day));
        if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
            return { ok: false, error: 'Encoded birth date (YYMMDD) is not a valid calendar date.' };
        }

        const now = new Date();
        if (dt > now) {
            return { ok: false, error: 'Encoded birth date cannot be in the future.' };
        }

        const govCode = id.slice(7, 9);
        const gov = GOVERNORATES[govCode];
        if (!gov) {
            return { ok: false, error: `Unknown governorate code "${govCode}".` };
        }

        let age = now.getUTCFullYear() - year;
        const mDiff = now.getUTCMonth() - (month - 1);
        if (mDiff < 0 || (mDiff === 0 && now.getUTCDate() < day)) age--;

        const isMale = Number(id[12]) % 2 === 1;
        let generation = 'Gen Alpha';
        if (year <= 1945) generation = 'Silent Generation';
        else if (year <= 1964) generation = 'Baby Boomer';
        else if (year <= 1980) generation = 'Gen X';
        else if (year <= 1996) generation = 'Millennial';
        else if (year <= 2012) generation = 'Gen Z';

        return {
            ok: true,
            birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            age: `${age} years`,
            gender: isMale ? 'Male (ذكر)' : 'Female (أنثى)',
            governorate: `${gov.en} · ${gov.ar}`,
            region: gov.region,
            generation,
            masked: `${id.slice(0, 3)}*********${id.slice(12)}`,
            traits: [gov.upper ? 'Upper Egypt' : 'Lower / Urban', gov.coastal ? 'Coastal' : 'Inland'].join(' · ')
        };
    }

    function mountEgyptNetDemo(container) {
        const card = el('div', 'demo-card');
        const intro = el('p', 'body-copy', 'Test a synthetic 14-digit Egyptian National ID using the same validation, calendar, and governorate rules implemented in Egypt.Net.Core.');
        intro.style.marginBottom = '1rem';
        card.appendChild(intro);

        const controls = el('div', 'demo-controls');
        const input = el('input', 'field-control');
        input.type = 'text';
        input.maxLength = 14;
        input.inputMode = 'numeric';
        input.placeholder = 'Enter 14-digit National ID (e.g. 30101010123458)';
        input.value = '30101010123458';
        input.setAttribute('aria-label', '14-digit Egyptian National ID');
        input.style.maxWidth = '20rem';

        const parseBtn = el('button', 'btn-primary', 'Parse ID');
        parseBtn.type = 'button';

        const sample1 = el('button', 'btn-secondary', 'Cairo 2001');
        sample1.type = 'button';
        const sample2 = el('button', 'btn-secondary', 'Alexandria 1995');
        sample2.type = 'button';
        const sample3 = el('button', 'btn-secondary', 'Aswan 2004');
        sample3.type = 'button';

        controls.append(input, parseBtn, sample1, sample2, sample3);
        card.appendChild(controls);

        const output = el('div');
        card.appendChild(output);

        function render() {
            output.replaceChildren();
            const res = parseEgyptianId(input.value);
            if (!res.ok) {
                output.appendChild(el('p', 'demo-error', res.error));
                return;
            }
            const grid = el('div', 'demo-grid');
            const fields = [
                ['Birth Date', res.birthDate],
                ['Age', res.age],
                ['Gender', res.gender],
                ['Governorate', res.governorate],
                ['Birth Region', res.region],
                ['Generation', res.generation],
                ['Classification', res.traits],
                ['Masked (Logs)', res.masked]
            ];
            for (const [k, v] of fields) {
                const stat = el('div', 'demo-stat');
                stat.appendChild(el('div', 'demo-stat-label', k));
                stat.appendChild(el('div', 'demo-stat-val', v));
                grid.appendChild(stat);
            }
            output.appendChild(grid);
        }

        parseBtn.addEventListener('click', render);
        input.addEventListener('input', () => {
            if (input.value.trim().length === 14) render();
        });
        sample1.addEventListener('click', () => { input.value = '30101010123458'; render(); });
        sample2.addEventListener('click', () => { input.value = '29508140212341'; render(); });
        sample3.addEventListener('click', () => { input.value = '30402292800422'; render(); });

        render();
        container.appendChild(card);
    }

    function mountKernelSimulatorDemo(container) {
        const card = el('div', 'demo-card');
        const intro = el('p', 'body-copy', 'Step through the tick-based simulation loop from kernel-simulator: I/O blocking recovery, starvation aging, quantum expiration, and priority preemption.');
        intro.style.marginBottom = '1rem';
        card.appendChild(intro);

        const controls = el('div', 'demo-controls');
        const policySelect = el('select', 'field-control');
        policySelect.setAttribute('aria-label', 'Scheduling policy');
        policySelect.style.maxWidth = '15rem';
        const optRR = el('option', '', 'Round Robin (Quantum = 2)');
        optRR.value = 'rr';
        const optPrio = el('option', '', 'Preemptive Priority + Aging');
        optPrio.value = 'prio';
        policySelect.append(optRR, optPrio);

        const stepBtn = el('button', 'btn-primary', 'Tick +1');
        stepBtn.type = 'button';
        const runBtn = el('button', 'btn-secondary', 'Run to Completion');
        runBtn.type = 'button';
        const resetBtn = el('button', 'btn-secondary', 'Reset');
        resetBtn.type = 'button';

        controls.append(policySelect, stepBtn, runBtn, resetBtn);
        card.appendChild(controls);

        const statusLine = el('p', 'meta-text');
        statusLine.style.marginTop = '0.9rem';
        card.appendChild(statusLine);

        const procGrid = el('div', 'demo-grid');
        card.appendChild(procGrid);

        const ganttWrap = el('div');
        ganttWrap.style.marginTop = '1rem';
        ganttWrap.appendChild(el('div', 'demo-stat-label', 'CPU Tick Timeline'));
        const ganttTrack = el('div', 'gantt-track');
        ganttWrap.appendChild(ganttTrack);
        card.appendChild(ganttWrap);

        let state;
        function resetState() {
            state = {
                tick: 0,
                quantum: 2,
                quantumUsed: 0,
                runningId: null,
                timeline: [],
                processes: [
                    { id: 'P1', remaining: 5, basePriority: 3, effPriority: 3, state: 'Ready', ioAt: 2, ioLeft: 0, waitTicks: 0 },
                    { id: 'P2', remaining: 3, basePriority: 1, effPriority: 1, state: 'Ready', ioAt: null, ioLeft: 0, waitTicks: 0 },
                    { id: 'P3', remaining: 4, basePriority: 4, effPriority: 4, state: 'Ready', ioAt: null, ioLeft: 0, waitTicks: 0 }
                ]
            };
        }

        function stepTick() {
            const allDone = state.processes.every(p => p.state === 'Finished');
            if (allDone) return false;

            const policy = policySelect.value;
            state.tick += 1;

            // 1. Handle blocked I/O processes
            for (const p of state.processes) {
                if (p.state === 'Blocked') {
                    p.ioLeft -= 1;
                    if (p.ioLeft <= 0) {
                        p.state = 'Ready';
                    }
                }
            }

            // 2. Apply aging to waiting Ready processes (every 3 ticks waiting boosts priority by 1, min 0)
            for (const p of state.processes) {
                if (p.state === 'Ready') {
                    p.waitTicks += 1;
                    if (policy === 'prio' && p.waitTicks > 0 && p.waitTicks % 3 === 0 && p.effPriority > 0) {
                        p.effPriority -= 1;
                    }
                }
            }

            // 3. Select / Preempt
            let running = state.processes.find(p => p.id === state.runningId && p.state === 'Running');
            const ready = state.processes.filter(p => p.state === 'Ready');

            if (policy === 'prio') {
                ready.sort((a, b) => a.effPriority - b.effPriority);
                if (running && ready.length > 0 && ready[0].effPriority < running.effPriority) {
                    running.state = 'Ready';
                    running.waitTicks = 0;
                    running = null;
                    state.runningId = null;
                }
            }

            if (!running && ready.length > 0) {
                if (policy === 'rr') {
                    // Pick first Ready process in rotation
                    const next = ready[0];
                    next.state = 'Running';
                    next.waitTicks = 0;
                    state.runningId = next.id;
                    state.quantumUsed = 0;
                    running = next;
                } else {
                    const next = ready[0];
                    next.state = 'Running';
                    next.waitTicks = 0;
                    state.runningId = next.id;
                    running = next;
                }
            }

            // 4. Execute one tick
            if (running) {
                running.remaining -= 1;
                state.quantumUsed += 1;
                state.timeline.push({ tick: state.tick, id: running.id });

                if (running.remaining <= 0) {
                    running.state = 'Finished';
                    state.runningId = null;
                    state.quantumUsed = 0;
                } else if (running.ioAt !== null && running.ioAt > 0) {
                    running.ioAt -= 1;
                    if (running.ioAt === 0) {
                        running.state = 'Blocked';
                        running.ioLeft = 2;
                        running.ioAt = null;
                        state.runningId = null;
                        state.quantumUsed = 0;
                    }
                }

                if (running.state === 'Running' && policy === 'rr' && state.quantumUsed >= state.quantum) {
                    running.state = 'Ready';
                    // Move rotated process to tail of array for true FIFO Ready Queue order
                    const idx = state.processes.indexOf(running);
                    state.processes.splice(idx, 1);
                    state.processes.push(running);
                    state.runningId = null;
                    state.quantumUsed = 0;
                }
            } else {
                state.timeline.push({ tick: state.tick, id: 'IDLE' });
            }

            return true;
        }

        function render() {
            const doneCount = state.processes.filter(p => p.state === 'Finished').length;
            statusLine.textContent = `Tick: ${state.tick} · Policy: ${policySelect.value === 'rr' ? 'Round Robin (Q=2)' : 'Preemptive Priority + Aging'} · Completed: ${doneCount}/${state.processes.length}`;

            procGrid.replaceChildren();
            const sorted = [...state.processes].sort((a, b) => a.id.localeCompare(b.id));
            for (const p of sorted) {
                const box = el('div', 'demo-stat');
                const top = el('div');
                top.style.display = 'flex';
                top.style.justifyContent = 'space-between';
                top.style.alignItems = 'center';
                top.appendChild(el('span', 'item-title', p.id));

                const pillClass = p.state === 'Running' ? 'pill-running'
                    : p.state === 'Ready' ? 'pill-ready'
                    : p.state === 'Blocked' ? 'pill-blocked'
                    : 'pill-finished';
                top.appendChild(el('span', `pill ${pillClass}`, p.state));
                box.appendChild(top);

                const details = el('div', 'meta-text', `Rem: ${p.remaining} · Prio: ${p.effPriority}${p.ioLeft > 0 ? ` · I/O: ${p.ioLeft}` : ''}`);
                details.style.marginTop = '0.35rem';
                box.appendChild(details);
                procGrid.appendChild(box);
            }

            ganttTrack.replaceChildren();
            if (state.timeline.length === 0) {
                ganttTrack.appendChild(el('span', 'meta-text', 'Press "Tick +1" to advance the CPU loop.'));
            } else {
                for (const slice of state.timeline) {
                    const cell = el('div', 'gantt-cell');
                    cell.appendChild(el('div', '', slice.id));
                    const tk = el('div', '', `t${slice.tick}`);
                    tk.style.color = '#737373';
                    cell.appendChild(tk);
                    ganttTrack.appendChild(cell);
                }
            }
        }

        stepBtn.addEventListener('click', () => {
            stepTick();
            render();
        });
        runBtn.addEventListener('click', () => {
            let guard = 0;
            while (stepTick() && guard < 40) guard++;
            render();
        });
        resetBtn.addEventListener('click', () => {
            resetState();
            render();
        });
        policySelect.addEventListener('change', () => {
            resetState();
            render();
        });

        resetState();
        render();
        container.appendChild(card);
    }

    window.mountProjectDemo = function (type, container) {
        if (!container) return;
        if (type === 'egypt-net') mountEgyptNetDemo(container);
        else if (type === 'kernel-simulator') mountKernelSimulatorDemo(container);
    };
})();

