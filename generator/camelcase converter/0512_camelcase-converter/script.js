/**
 * 512 - CamelCase Converter
 * Converts text to camelCase
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CamelCase Converter', icon: '🐪' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function toCamelCase(text) {
        if (!text.trim()) return '';
        return text.trim()
            .replace(/[^a-zA-Z0-9\s_-]/g, '')
            .split(/[\s_-]+/)
            .filter(w => w)
            .map((word, i) => {
                if (i === 0) return word.toLowerCase();
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    function toPascalCase(text) {
        if (!text.trim()) return '';
        return text.trim()
            .replace(/[^a-zA-Z0-9\s_-]/g, '')
            .split(/[\s_-]+/)
            .filter(w => w)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text'; return; }
        let result = `═══ camelCase ═══\n\n${toCamelCase(input)}\n\n`;
        result += `═══ PascalCase ═══\n\n${toPascalCase(input)}`;
        outputEl.textContent = result;
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
    inputEl.addEventListener('input', debounce(calculate, 300));
});
