/**
 * Aspect Ratio Calculator
 * Calculate aspect ratios for containers
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Aspect Ratio Calculator', icon: '' });

    const ratio = $('#ar-ratio'), customDiv = $('#ar-custom');
    const customW = $('#ar-w'), customH = $('#ar-h');
    const width = $('#ar-width');
    const preview = $('#ar-preview');
    const output = $('#ar-css');
    const copyBtn = $('#copy');

    function gen() {
        let rw, rh;
        const r = ratio.value;

        if (r === 'custom') {
            customDiv.style.display = 'block';
            rw = parseInt(customW.value) || 16;
            rh = parseInt(customH.value) || 9;
        } else {
            customDiv.style.display = 'none';
            [rw, rh] = r.split(':').map(Number);
        }

        const containerW = parseInt(width.value) || 800;
        const containerH = Math.round(containerW * rh / rw);
        const pct = (rh / rw * 100).toFixed(4);

        const css = `/* Modern approach */\n.container {\n  aspect-ratio: ${rw} / ${rh};\n  width: ${containerW}px;\n  height: ${containerH}px; /* auto with aspect-ratio */\n}\n\n/* Legacy fallback (padding trick) */\n.container {\n  position: relative;\n  width: ${containerW}px;\n  padding-bottom: ${pct}%;\n  height: 0;\n}\n\n.container > * {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}`;

        const maxPreviewW = 280;
        const previewW = Math.min(containerW, maxPreviewW);
        const previewH = previewW * rh / rw;

        preview.innerHTML = `<div style="width:${previewW}px;height:${previewH}px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;font-size:14px;font-weight:600;">${rw}:${rh}</div>`;
        output.textContent = css;
    }

    ratio.addEventListener('change', gen);
    customW.addEventListener('input', gen);
    customH.addEventListener('input', gen);
    width.addEventListener('input', gen);
    copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
    gen();
});
