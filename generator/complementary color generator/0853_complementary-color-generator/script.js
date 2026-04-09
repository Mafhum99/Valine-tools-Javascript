/**
 * Complementary Color Generator
 * Generate complementary color (hue + 180 degrees)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Complementary Color Generator', icon: '🔄' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const originalPreview = $('#original-preview');
    const complementaryPreview = $('#complementary-preview');
    const originalHex = $('#original-hex');
    const originalRgb = $('#original-rgb');
    const complementaryHex = $('#complementary-hex');
    const complementaryRgb = $('#complementary-rgb');

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const compHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l };
        const compRgb = Color.hslToRgb(compHsl.h, compHsl.s, compHsl.l);
        const cleanHex = Color.rgbToHex(rgb.r, rgb.g, rgb.b);
        const compHex = Color.rgbToHex(compRgb.r, compRgb.g, compRgb.b);

        originalPreview.style.backgroundColor = cleanHex;
        complementaryPreview.style.backgroundColor = compHex;

        originalHex.textContent = cleanHex.toUpperCase();
        originalRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        complementaryHex.textContent = compHex.toUpperCase();
        complementaryRgb.textContent = `rgb(${compRgb.r}, ${compRgb.g}, ${compRgb.b})`;
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
