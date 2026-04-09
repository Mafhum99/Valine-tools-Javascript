/**
 * Split Complementary Generator
 * Generate split complementary color palette
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Split Complementary Generator', icon: '🎨' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const basePreview = $('#base-preview');
    const split1Preview = $('#split1-preview');
    const split2Preview = $('#split2-preview');
    const baseHex = $('#base-hex');
    const split1Hex = $('#split1-hex');
    const split2Hex = $('#split2-hex');

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const split1Hsl = { h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l };
        const split2Hsl = { h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l };

        const baseRgbVal = Color.hslToRgb(hsl.h, hsl.s, hsl.l);
        const split1Rgb = Color.hslToRgb(split1Hsl.h, split1Hsl.s, split1Hsl.l);
        const split2Rgb = Color.hslToRgb(split2Hsl.h, split2Hsl.s, split2Hsl.l);

        const baseHexVal = Color.rgbToHex(baseRgbVal.r, baseRgbVal.g, baseRgbVal.b);
        const split1HexVal = Color.rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b);
        const split2HexVal = Color.rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b);

        basePreview.style.backgroundColor = baseHexVal;
        split1Preview.style.backgroundColor = split1HexVal;
        split2Preview.style.backgroundColor = split2HexVal;

        baseHex.textContent = baseHexVal.toUpperCase();
        split1Hex.textContent = split1HexVal.toUpperCase();
        split2Hex.textContent = split2HexVal.toUpperCase();
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
