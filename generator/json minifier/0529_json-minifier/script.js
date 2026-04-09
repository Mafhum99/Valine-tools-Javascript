/**
 * 529 - JSON Minifier
 * Minifies JSON data by removing whitespace
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'JSON Minifier', icon: '📦' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function minifyJSON(json) {
        let parsed;
        try {
            parsed = JSON.parse(json);
        } catch (e) {
            // Try stripping comments manually if JSON.parse fails
            let stripped = json
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .trim();
            parsed = JSON.parse(stripped);
        }

        return JSON.stringify(parsed);
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter JSON data'; return; }

        try {
            const minified = minifyJSON(input);

            let output = '═══ Minified JSON ═══\n\n';
            output += minified;
            output += `\n\n═══ Stats ═══\n\n`;
            output += `Original size: ${input.length} chars\n`;
            output += `Minified size: ${minified.length} chars\n`;
            output += `Saved: ${input.length - minified.length} chars (${((1 - minified.length / input.length) * 100).toFixed(1)}%)`;
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
