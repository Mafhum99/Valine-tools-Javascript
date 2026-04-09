/**
 * Random Color Generator
 * Generate random colors with display and copy
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Random Color Generator', icon: '🎲' });

    const generateBtn = $('#generate');
    const colorPreview = $('#color-preview');
    const hexValue = $('#hex-value');
    const rgbValue = $('#rgb-value');
    const hslValue = $('#hsl-value');

    function generateColor() {
        const hex = Color.random();
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cleanHex = Color.rgbToHex(rgb.r, rgb.g, rgb.b);

        colorPreview.style.backgroundColor = cleanHex;
        hexValue.textContent = cleanHex.toUpperCase();
        rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslValue.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }

    generateBtn.addEventListener('click', generateColor);

    $$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const text = $(`#${target}`).textContent;
            copyToClipboard(text);
        });
    });

    // Generate initial color
    generateColor();
});
