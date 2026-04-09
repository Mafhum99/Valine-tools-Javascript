/**
 * EM to PX Converter
 * Convert em units to pixels
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'EM to PX Converter', icon: '' });

    const emVal = $('#em-value'), parentSize = $('#em-parent-size');
    const output = $('#em-css');
    const copyBtn = $('#copy');

    function gen() {
        const em = parseFloat(emVal.value) || 0;
        const parent = parseFloat(parentSize.value) || 16;
        const px = em * parent;

        const css = `/* Conversion */\n${em}em = ${px}px (at ${parent}px parent)\n\n/* CSS */\nfont-size: ${em}em; /* = ${px}px */\n\n/* Common EM values at ${parent}px base */\n`;
        [0.5, 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2, 2.5, 3].forEach(v => {
            css += `${v}em = ${(v * parent).toFixed(1)}px\n`;
        });

        output.textContent = css;
    }

    emVal.addEventListener('input', gen);
    parentSize.addEventListener('input', gen);
    copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
    gen();
});
