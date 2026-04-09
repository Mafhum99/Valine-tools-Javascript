/**
 * Triadic Color Generator
 * Generate triadic colors at 120 degree intervals
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Triadic Color Generator', icon: '🔺' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const color1Preview = $('#color1-preview');
    const color2Preview = $('#color2-preview');
    const color3Preview = $('#color3-preview');
    const color1Hex = $('#color1-hex');
    const color2Hex = $('#color2-hex');
    const color3Hex = $('#color3-hex');

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsl2 = { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l };
        const hsl3 = { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l };

        const rgb1 = Color.hslToRgb(hsl.h, hsl.s, hsl.l);
        const rgb2 = Color.hslToRgb(hsl2.h, hsl2.s, hsl2.l);
        const rgb3 = Color.hslToRgb(hsl3.h, hsl3.s, hsl3.l);

        const hex1 = Color.rgbToHex(rgb1.r, rgb1.g, rgb1.b);
        const hex2 = Color.rgbToHex(rgb2.r, rgb2.g, rgb2.b);
        const hex3 = Color.rgbToHex(rgb3.r, rgb3.g, rgb3.b);

        color1Preview.style.backgroundColor = hex1;
        color2Preview.style.backgroundColor = hex2;
        color3Preview.style.backgroundColor = hex3;

        color1Hex.textContent = hex1.toUpperCase();
        color2Hex.textContent = hex2.toUpperCase();
        color3Hex.textContent = hex3.toUpperCase();
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
