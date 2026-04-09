/**
 * Text to Binary Converter
 * Convert text to its binary representation
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Text to Binary Converter', icon: '🔢' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text to convert'; return; }
        try {
            const binary = input.split('').map(char => {
                const code = char.charCodeAt(0);
                return code.toString(2).padStart(8, '0');
            }).join(' ');
            outputEl.textContent = binary;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
