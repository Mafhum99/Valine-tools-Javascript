/**
 * URL Decoder
 * Decode URL-encoded strings
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'URL Decoder', icon: '\u{1F513}' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const decodeBtn = $('#decode');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function decode() {
        const input = inputEl.value;

        if (!input) {
            outputEl.textContent = 'Please enter URL-encoded text';
            return;
        }

        try {
            // Try decodeURIComponent first, fall back to decodeURI for partial encoding
            let result;
            try {
                result = decodeURIComponent(input);
            } catch {
                // If the input has mixed encoding, try line by line
                const lines = input.split('\n');
                result = lines.map(line => {
                    try {
                        return decodeURIComponent(line);
                    } catch {
                        return line;
                    }
                }).join('\n');
            }
            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: Invalid encoded text - ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    decodeBtn.addEventListener('click', decode);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
