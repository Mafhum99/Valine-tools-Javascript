/**
 * Analogous Color Generator
 * Generate analogous colors at -30 and +30 degrees
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Analogous Color Generator', icon: '🎨' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const leftPreview = $('#left-preview');
    const basePreview = $('#base-preview');
    const rightPreview = $('#right-preview');
    const leftHex = $('#left-hex');
    const baseHex = $('#base-hex');
    const rightHex = $('#right-hex');

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const leftHsl = { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l };
        const rightHsl = { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l };

        const leftRgb = Color.hslToRgb(leftHsl.h, leftHsl.s, leftHsl.l);
        const rightRgb = Color.hslToRgb(rightHsl.h, rightHsl.s, rightHsl.l);

        const leftHexVal = Color.rgbToHex(leftRgb.r, leftRgb.g, leftRgb.b);
        const baseHexVal = Color.rgbToHex(rgb.r, rgb.g, rgb.b);
        const rightHexVal = Color.rgbToHex(rightRgb.r, rightRgb.g, rightRgb.b);

        leftPreview.style.backgroundColor = leftHexVal;
        basePreview.style.backgroundColor = baseHexVal;
        rightPreview.style.backgroundColor = rightHexVal;

        leftHex.textContent = leftHexVal.toUpperCase();
        baseHex.textContent = baseHexVal.toUpperCase();
        rightHex.textContent = rightHexVal.toUpperCase();
    }

    colorInput.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        updateColors(e.target.value);
    });

    hexInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
            const hex = val.startsWith('#') ? val : '#' + val;
            colorInput.value = hex;
            updateColors(hex);
        }
    });

    $$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const text = $(`#${target}`).textContent;
            copyToClipboard(text);
        });
    });

    updateColors('#3b82f6');
});
