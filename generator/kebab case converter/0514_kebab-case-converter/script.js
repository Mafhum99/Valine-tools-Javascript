/**
 * 514 - Kebab Case Converter
 * Converts text to kebab-case
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Kebab Case Converter', icon: '🥙' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function toKebabCase(text) {
        if (!text.trim()) return '';
        return text.trim()
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase();
    }

    function calculate() {
        const input = inputEl.value.trim();
        outputEl.textContent = input ? toKebabCase(input) : 'Please enter text';
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
    inputEl.addEventListener('input', debounce(calculate, 300));
});
