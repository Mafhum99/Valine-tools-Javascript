/**
 * CSS Grid Generator
 * Generate CSS grid layouts visually
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Grid Generator', icon: '' });

    const cols = $('#grid-cols'), rows = $('#grid-rows'), gap = $('#grid-gap');
    const items = $('#grid-items'), color = $('#grid-color'), colorText = $('#grid-color-text');
    const colsVal = $('#grid-cols-value'), rowsVal = $('#grid-rows-value');
    const gapVal = $('#grid-gap-value'), itemsVal = $('#grid-items-value');
    const preview = $('#grid-preview');
    const output = $('#grid-css');
    const copyBtn = $('#copy');

    function isValidHex(h) { return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(h); }
    function sync(p, t) {
        p.addEventListener('input', () => { t.value = p.value; gen(); });
        t.addEventListener('input', () => { if (isValidHex(t.value)) { p.value = t.value; gen(); } });
    }

    function gen() {
        const nc = parseInt(cols.value), nr = parseInt(rows.value);
        const ng = parseInt(gap.value), ni = parseInt(items.value);
        const c = color.value;
        colsVal.textContent = nc; rowsVal.textContent = nr;
        gapVal.textContent = ng + 'px'; itemsVal.textContent = ni;

        const css = `display: grid;\ngrid-template-columns: repeat(${nc}, 1fr);\ngrid-template-rows: repeat(${nr}, 1fr);\ngap: ${ng}px;`;

        preview.style.cssText = `display:grid;grid-template-columns:repeat(${nc},1fr);grid-template-rows:repeat(${nr},1fr);gap:${ng}px;min-height:200px;`;
        let html = '';
        for (let i = 0; i < ni; i++) {
            html += `<div style="background:${c};color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:14px;font-weight:600;aspect-ratio:4/3;">${i + 1}</div>`;
        }
        preview.innerHTML = html;
        output.textContent = css;
    }

    sync(color, colorText);
    cols.addEventListener('input', gen);
    rows.addEventListener('input', gen);
    gap.addEventListener('input', gen);
    items.addEventListener('input', gen);
    copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
    gen();
});
