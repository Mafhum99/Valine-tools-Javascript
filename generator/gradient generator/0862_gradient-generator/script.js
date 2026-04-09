/**
 * Gradient Generator
 * Generate CSS gradients
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Gradient Generator', icon: '' });

    const angleSlider = $('#angle');
    const angleValue = $('#angle-value');
    const colorStopsContainer = $('#color-stops');
    const preview = $('#gradient-preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const randomBtn = $('#random');
    const addStopBtn = $('#add-stop');
    const removeStopBtn = $('#remove-stop');

    let stopCount = 2;
    const maxStops = 4;
    const minStops = 2;

    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    function getColorStops() {
        const rows = $$('.color-stop-row');
        const colors = [];
        rows.forEach((row, i) => {
            const picker = row.querySelector('.stop-color');
            const textInput = row.querySelector('.stop-color-text');
            let color = picker.value;
            if (!isValidHex(color)) {
                let val = textInput.value.trim();
                if (!val.startsWith('#')) val = '#' + val;
                if (isValidHex(val)) color = val;
            }
            if (isValidHex(color)) {
                const position = rows.length <= 1 ? '' : ` ${Math.round((i / (rows.length - 1)) * 100)}%`;
                colors.push(color + position);
            }
        });
        return colors;
    }

    function generateGradient() {
        try {
            const angle = angleSlider.value;
            angleValue.textContent = angle + 'deg';

            const colors = getColorStops();
            if (colors.length < minStops) {
                cssCode.textContent = 'Error: Need at least 2 color stops';
                return;
            }

            const gradientStr = colors.join(', ');
            const css = `background: linear-gradient(${angle}deg, ${gradientStr});`;
            preview.style.background = `linear-gradient(${angle}deg, ${gradientStr})`;
            cssCode.textContent = css;
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    function syncColor(picker, textInput) {
        textInput.value = picker.value;
        generateGradient();
    }

    function syncTextToPicker(textInput, picker) {
        let val = textInput.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (isValidHex(val)) {
            picker.value = val;
            generateGradient();
        }
    }

    function addStopRow() {
        if (stopCount >= maxStops) return;
        stopCount++;
        const idx = stopCount - 1;
        const randomColor = Color.random();
        const row = document.createElement('div');
        row.className = 'color-stop-row';
        row.dataset.index = idx;
        row.innerHTML = `
            <input type="color" value="${randomColor}" class="color-picker stop-color">
            <input type="text" value="${randomColor}" class="form-input color-text stop-color-text" maxlength="7" placeholder="#hex">
            <span class="stop-position-label">${Math.round((idx / (stopCount - 1)) * 100)}%</span>
        `;
        colorStopsContainer.querySelector('.form-group').appendChild(row);
        bindRowEvents(row);
        updateStopLabels();
        generateGradient();
    }

    function removeStopRow() {
        if (stopCount <= minStops) return;
        const rows = $$('.color-stop-row');
        const lastRow = rows[rows.length - 1];
        if (lastRow) lastRow.remove();
        stopCount--;
        updateStopLabels();
        generateGradient();
    }

    function updateStopLabels() {
        const rows = $$('.color-stop-row');
        rows.forEach((row, i) => {
            const label = row.querySelector('.stop-position-label');
            if (label) {
                label.textContent = rows.length <= 1 ? '' : `${Math.round((i / (rows.length - 1)) * 100)}%`;
            }
        });
    }

    function bindRowEvents(row) {
        const picker = row.querySelector('.stop-color');
        const textInput = row.querySelector('.stop-color-text');
        picker.addEventListener('input', () => syncColor(picker, textInput));
        textInput.addEventListener('input', () => syncTextToPicker(textInput, picker));
    }

    // Bind existing rows
    $$('.color-stop-row').forEach(bindRowEvents);

    // Angle slider
    angleSlider.addEventListener('input', generateGradient);

    // Add/remove stops
    addStopBtn.addEventListener('click', addStopRow);
    removeStopBtn.addEventListener('click', removeStopRow);

    // Copy
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    // Random
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            $$('.color-stop-row').forEach(row => {
                const picker = row.querySelector('.stop-color');
                const textInput = row.querySelector('.stop-color-text');
                const c = Color.random();
                picker.value = c;
                textInput.value = c;
            });
            generateGradient();
        });
    }

    generateGradient();
});
