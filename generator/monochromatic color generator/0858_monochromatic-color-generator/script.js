/**
 * Monochromatic Color Generator
 * Generate monochromatic shades by varying lightness
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Monochromatic Color Generator', icon: '🎨' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const shadesContainer = $('#shades-container');

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        shadesContainer.innerHTML = '';

        // Generate 7 shades from darkest to lightest
        const lightnessValues = [15, 25, 40, 50, 60, 75, 90];

        lightnessValues.forEach(l => {
            const shadeHsl = { h: hsl.h, s: hsl.s, l: Math.min(l, 95) };
            const shadeRgb = Color.hslToRgb(shadeHsl.h, shadeHsl.s, shadeHsl.l);
            const shadeHex = Color.rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);

            const shadeItem = document.createElement('div');
            shadeItem.className = 'color-swatch-item';
            shadeItem.innerHTML = `
                <div class="color-swatch" style="background-color: ${shadeHex};"></div>
                <div class="color-swatch-info">
                    <span class="color-value">${shadeHex.toUpperCase()}</span>
                    <button class="copy-btn" data-value="${shadeHex.toUpperCase()}">📋</button>
                </div>
            `;
            shadesContainer.appendChild(shadeItem);
        });

        // Add copy event listeners
        shadesContainer.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                copyToClipboard(btn.dataset.value);
            });
        });
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

    updateColors('#3b82f6');
});
