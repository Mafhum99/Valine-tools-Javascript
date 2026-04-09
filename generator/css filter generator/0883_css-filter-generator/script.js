/**
 * CSS Filter Generator
 * Generate CSS filter effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Filter Generator', icon: '' });

    const blur = $('#blur');
    const brightness = $('#brightness');
    const contrast = $('#contrast');
    const saturate = $('#saturate');
    const hueRotate = $('#hue-rotate');
    const opacity = $('#opacity');
    const sepia = $('#sepia');
    const grayscale = $('#grayscale');
    const invert = $('#invert');
    const preview = $('#preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const resetBtn = $('#reset');

    const filterDefaults = {
        blur: { el: blur, val: 0, unit: 'px', displayEl: $('#blur-value') },
        brightness: { el: brightness, val: 100, unit: '%', displayEl: $('#brightness-value') },
        contrast: { el: contrast, val: 100, unit: '%', displayEl: $('#contrast-value') },
        saturate: { el: saturate, val: 100, unit: '%', displayEl: $('#saturate-value') },
        'hue-rotate': { el: hueRotate, val: 0, unit: 'deg', displayEl: $('#hue-rotate-value') },
        opacity: { el: opacity, val: 100, unit: '%', displayEl: $('#opacity-value') },
        sepia: { el: sepia, val: 0, unit: '%', displayEl: $('#sepia-value') },
        grayscale: { el: grayscale, val: 0, unit: '%', displayEl: $('#grayscale-value') },
        invert: { el: invert, val: 0, unit: '%', displayEl: $('#invert-value') }
    };

    function generateFilter() {
        try {
            const filters = [];

            for (const [name, cfg] of Object.entries(filterDefaults)) {
                const value = parseFloat(cfg.el.value);
                cfg.displayEl.textContent = value + cfg.unit;

                const isDefault = value === cfg.val;
                if (!isDefault || name === 'blur') {
                    if (name === 'blur' && value === 0) continue;
                    if (value !== cfg.val) {
                        filters.push(`${name}(${value}${cfg.unit})`);
                    }
                }
            }

            const filterValue = filters.length > 0 ? filters.join(' ') : 'none';
            const css = `filter: ${filterValue};`;

            preview.style.filter = filterValue;
            cssCode.textContent = css;
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    function reset() {
        for (const [name, cfg] of Object.entries(filterDefaults)) {
            cfg.el.value = cfg.val;
        }
        generateFilter();
    }

    // Event listeners
    Object.values(filterDefaults).forEach(cfg => {
        cfg.el.addEventListener('input', generateFilter);
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', reset);
    }

    generateFilter();
});
