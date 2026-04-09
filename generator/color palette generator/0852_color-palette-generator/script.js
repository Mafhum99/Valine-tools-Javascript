/**
 * Color Palette Generator
 * Generate harmonious color palettes from a base color
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Color Palette Generator', icon: '🎨' });

    const baseColorInput = $('#base-color');
    const harmonySelect = $('#harmony');
    const generateBtn = $('#generate');
    const paletteContainer = $('#palette');

    function generatePalette() {
        const baseHex = baseColorInput.value;
        const rgb = Color.hexToRgb(baseHex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const harmony = harmonySelect.value;
        let colors = [];

        switch (harmony) {
            case 'complementary':
                colors = [
                    hsl,
                    { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'analogous':
                colors = [
                    { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
                    hsl,
                    { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'triadic':
                colors = [
                    hsl,
                    { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'split-complementary':
                colors = [
                    hsl,
                    { h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'tetradic':
                colors = [
                    hsl,
                    { h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'monochromatic':
                colors = [
                    { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 30, 10) },
                    { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 15, 20) },
                    hsl,
                    { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 15, 85) },
                    { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 30, 95) }
                ];
                break;
        }

        renderPalette(colors);
    }

    function renderPalette(colors) {
        paletteContainer.innerHTML = '';
        colors.forEach(hsl => {
            const rgb = Color.hslToRgb(hsl.h, hsl.s, hsl.l);
            const hex = Color.rgbToHex(rgb.r, rgb.g, rgb.b);

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;
            swatch.innerHTML = `
                <div class="color-swatch-info">
                    <div class="color-swatch-hex">${hex.toUpperCase()}</div>
                    <div class="color-swatch-rgb">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
                </div>
            `;
            swatch.addEventListener('click', () => copyToClipboard(hex.toUpperCase()));
            paletteContainer.appendChild(swatch);
        });
    }

    generateBtn.addEventListener('click', generatePalette);
    baseColorInput.addEventListener('input', generatePalette);
    harmonySelect.addEventListener('change', generatePalette);

    // Initialize
    generatePalette();
});
