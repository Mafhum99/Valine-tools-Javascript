/**
 * Outline Generator
 * Generate CSS outline styles
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Outline Generator', icon: '\uD83D\uDD32' });

    const outlineWidth = $('#outline-width');
    const outlineStyle = $('#outline-style');
    const outlineColorPicker = $('#outline-color');
    const outlineColorText = $('#outline-color-text');
    const outlineOffset = $('#outline-offset');
    const outlinePreview = $('#outline-preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const presetFocus = $('#preset-focus');
    const presetBadge = $('#preset-badge');

    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    function syncColor(picker, textInput) {
        textInput.value = picker.value;
        generateOutline();
    }

    function syncTextToPicker(textInput, picker) {
        let val = textInput.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (isValidHex(val)) {
            picker.value = val;
            generateOutline();
        }
    }

    function generateOutline() {
        try {
            const width = parseInt(outlineWidth.value) || 0;
            const style = outlineStyle.value;
            const color = outlineColorPicker.value;
            const offset = parseInt(outlineOffset.value) || 0;

            $('#outline-width-value').textContent = width + 'px';
            $('#outline-offset-value').textContent = offset + 'px';

            if (!isValidHex(color)) {
                cssCode.textContent = 'Error: Invalid hex color';
                return;
            }

            const css = `outline: ${width}px ${style} ${color};\noutline-offset: ${offset}px;`;

            outlinePreview.style.outline = `${width}px ${style} ${color}`;
            outlinePreview.style.outlineOffset = `${offset}px`;
            cssCode.textContent = css;
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    outlineWidth.addEventListener('input', generateOutline);
    outlineStyle.addEventListener('change', generateOutline);
    outlineOffset.addEventListener('input', generateOutline);
    outlineColorPicker.addEventListener('input', () => syncColor(outlineColorPicker, outlineColorText));
    outlineColorText.addEventListener('input', () => syncTextToPicker(outlineColorText, outlineColorPicker));

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    if (presetFocus) {
        presetFocus.addEventListener('click', () => {
            outlineWidth.value = 2;
            outlineStyle.value = 'solid';
            outlineColorPicker.value = '#2563eb'; outlineColorText.value = '#2563eb';
            outlineOffset.value = 2;
            generateOutline();
        });
    }

    if (presetBadge) {
        presetBadge.addEventListener('click', () => {
            outlineWidth.value = 3;
            outlineStyle.value = 'dotted';
            outlineColorPicker.value = '#f59e0b'; outlineColorText.value = '#f59e0b';
            outlineOffset.value = 6;
            generateOutline();
        });
    }

    generateOutline();
});
