/**
 * 513 - Snake Case Converter
 * Converts text to snake_case
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Snake Case Converter', icon: '🐍' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function toSnakeCase(text) {
        if (!text.trim()) return '';
        return text.trim()
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .toLowerCase();
    }

    function calculate() {
        const input = inputEl.value.trim();
        outputEl.textContent = input ? toSnakeCase(input) : 'Please enter text';
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
    inputEl.addEventListener('input', debounce(calculate, 300));
});
