/**
 * Tetradic Color Generator
 * Generate 4-color tetradic palette at 90 degree intervals
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Tetradic Color Generator', icon: '🟦' });

    const colorInput = $('#color-input');
    const hexInput = $('#hex-input');
    const previews = [
        $('#color1-preview'), $('#color2-preview'),
        $('#color3-preview'), $('#color4-preview')
    ];
    const hexDisplays = [
        $('#color1-hex'), $('#color2-hex'),
        $('#color3-hex'), $('#color4-hex')
    ];

    function updateColors(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const offsets = [0, 90, 180, 270];

        offsets.forEach((offset, i) => {
            const hslColor = { h: (hsl.h + offset) % 360, s: hsl.s, l: hsl.l };
            const rgbColor = Color.hslToRgb(hslColor.h, hslColor.s, hslColor.l);
            const hexColor = Color.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);

            previews[i].style.backgroundColor = hexColor;
            hexDisplays[i].textContent = hexColor.toUpperCase();
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

    $$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const text = $(`#${target}`).textContent;
            copyToClipboard(text);
        });
    });

    updateColors('#3b82f6');
});
