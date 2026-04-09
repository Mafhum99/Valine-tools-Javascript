/**
 * Binary to Text Converter
 * Convert binary representation back to text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Binary to Text Converter', icon: '🔤' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter binary data to convert'; return; }
        try {
            // Remove any non-0/1 characters and split into 8-bit groups
            const cleaned = input.replace(/[^01]/g, '');
            if (cleaned.length === 0) { outputEl.textContent = 'Error: No valid binary data found'; return; }
            if (cleaned.length % 8 !== 0) {
                outputEl.textContent = 'Error: Binary data length (' + cleaned.length + ') is not a multiple of 8';
                return;
            }
            const text = cleaned.match(/.{8}/g).map(byte => {
                const code = parseInt(byte, 2);
                if (code > 0x10FFFF) throw new Error('Invalid character code: ' + code);
                return String.fromCharCode(code);
            }).join('');
            outputEl.textContent = text;
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
