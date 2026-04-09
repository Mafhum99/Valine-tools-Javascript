/**
 * CSS Pattern Generator
 * Generate CSS repeating patterns with different styles
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Pattern Generator', icon: '' });

    const type = $('#pattern-type');
    const color1 = $('#css-color1');
    const color1Text = $('#css-color1-text');
    const color2 = $('#css-color2');
    const color2Text = $('#css-color2-text');
    const sizeSlider = $('#css-pattern-size');
    const sizeValue = $('#css-pattern-size-value');
    const preview = $('#css-pattern-preview');
    const output = $('#css-pattern-css');
    const copyBtn = $('#copy');
    const randomBtn = $('#random');

    function isValidHex(hex) { return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex); }

    function syncColor(picker, text) {
        picker.addEventListener('input', () => { text.value = picker.value; generate(); });
        text.addEventListener('input', () => { if (isValidHex(text.value)) { picker.value = text.value; generate(); } });
    }

    function generate() {
        const t = type.value;
        const c1 = color1.value;
        const c2 = color2.value;
        const s = parseInt(sizeSlider.value);
        sizeValue.textContent = s + 'px';

        let bg = '', label = '';
        const half = s / 2;

        switch (t) {
            case 'stripes':
                bg = `repeating-linear-gradient(45deg, ${c1} 0px, ${c1} ${half}px, ${c2} ${half}px, ${c2} ${s}px)`;
                label = `background: ${bg};`;
                break;
            case 'dots':
                bg = `radial-gradient(circle, ${c1} ${s * 0.15}px, transparent ${s * 0.15}px) 0 0 / ${s}px ${s}px`;
                label = `background-color: ${c2};\nbackground-image: ${bg};`;
                break;
            case 'checkerboard':
                bg = `conic-gradient(${c1} 25%, ${c2} 25% 50%, ${c1} 50% 75%, ${c2} 75%) 0 0 / ${s}px ${s}px`;
                label = `background-image: ${bg};`;
                break;
            case 'crosshatch':
                bg = `repeating-linear-gradient(0deg, transparent, transparent ${half}px, ${c1} ${half}px, ${c1} ${s}px),\n    repeating-linear-gradient(90deg, transparent, transparent ${half}px, ${c1} ${half}px, ${c1} ${s}px)`;
                label = `background-color: ${c2};\nbackground-image: ${bg};`;
                break;
            case 'zigzag':
                bg = `linear-gradient(135deg, ${c1} 25%, transparent 25%) -${half}px 0,\n    linear-gradient(225deg, ${c1} 25%, transparent 25%) -${half}px 0,\n    linear-gradient(315deg, ${c1} 25%, transparent 25%),\n    linear-gradient(45deg, ${c1} 25%, transparent 25%)`;
                label = `background-color: ${c2};\nbackground-size: ${s}px ${s}px;\nbackground-image: ${bg};`;
                break;
        }

        preview.style.background = t === 'dots' ? `${bg}` : t === 'crosshatch' ? `${bg}` : t === 'zigzag' ? `${bg}` : bg;
        if (t === 'dots') { preview.style.backgroundColor = c2; preview.style.backgroundImage = `radial-gradient(circle, ${c1} ${s*0.15}px, transparent ${s*0.15}px)`; preview.style.backgroundSize = `${s}px ${s}px`; }
        else if (t === 'crosshatch') { preview.style.backgroundColor = c2; preview.style.backgroundImage = `repeating-linear-gradient(0deg, transparent, transparent ${half}px, ${c1} ${half}px, ${c1} ${s}px), repeating-linear-gradient(90deg, transparent, transparent ${half}px, ${c1} ${half}px, ${c1} ${s}px)`; }
        else if (t === 'zigzag') { preview.style.backgroundColor = c2; preview.style.backgroundSize = `${s}px ${s}px`; preview.style.backgroundImage = `linear-gradient(135deg, ${c1} 25%, transparent 25%), linear-gradient(225deg, ${c1} 25%, transparent 25%), linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%)`; preview.style.backgroundPosition = `-${half}px 0, -${half}px 0, 0 0, 0 0`; }
        else { preview.style.background = bg; }

        output.textContent = label;
    }

    syncColor(color1, color1Text);
    syncColor(color2, color2Text);
    type.addEventListener('change', generate);
    sizeSlider.addEventListener('input', generate);
    copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
    randomBtn.addEventListener('click', () => {
        const r1 = Color.random(), r2 = Color.random();
        color1.value = r1; color1Text.value = r1;
        color2.value = r2; color2Text.value = r2;
        generate();
    });

    generate();
});
