/**
 * Color Picker
 * Pick and preview colors with HEX, RGB, and HSL values
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Color Picker', icon: '🎨' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const colorPreview = $('#color-preview');
    const hexValue = $('#hex-value');
    const rgbValue = $('#rgb-value');
    const hslValue = $('#hsl-value');

    function updateColor(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cleanHex = Color.rgbToHex(rgb.r, rgb.g, rgb.b);

        colorPreview.style.backgroundColor = cleanHex;
        hexValue.textContent = cleanHex.toUpperCase();
        rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslValue.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }

    colorInput.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        updateColor(e.target.value);
    });

    hexInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
            const hex = val.startsWith('#') ? val : '#' + val;
            colorInput.value = hex;
            updateColor(hex);
        }
    });

    $$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.value;
            let text = '';
            if (type === 'hex') text = hexValue.textContent;
            else if (type === 'rgb') text = rgbValue.textContent;
            else if (type === 'hsl') text = hslValue.textContent;
            copyToClipboard(text);
        });
    });

    // Initialize with default color
    updateColor('#3b82f6');
});
