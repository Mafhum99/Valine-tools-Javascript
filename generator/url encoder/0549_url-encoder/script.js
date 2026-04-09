/**
 * URL Encoder
 * Encode strings for URLs
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'URL Encoder', icon: '\u{1F512}' });

    const inputEl = $('#input');
    const encodingTypeEl = $('#encoding-type');
    const outputEl = $('#output');
    const encodeBtn = $('#encode');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function encode() {
        const input = inputEl.value;

        if (!input) {
            outputEl.textContent = 'Please enter text to encode';
            return;
        }

        try {
            let result;
            if (encodingTypeEl.value === 'component') {
                result = encodeURIComponent(input);
            } else {
                result = encodeURI(input);
            }
            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    encodeBtn.addEventListener('click', encode);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
