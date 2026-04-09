/**
 * Text Splitter
 * Split text by delimiter
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Text Splitter', icon: '\u2702\uFE0F' });

    const inputEl = $('#input');
    const delimiterEl = $('#delimiter');
    const customDelimiterGroup = $('#custom-delimiter-group');
    const customDelimiterEl = $('#custom-delimiter');
    const trimItemsEl = $('#trim-items');
    const outputEl = $('#output');
    const splitBtn = $('#split');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function getDelimiter() {
        const val = delimiterEl.value;
        if (val === 'custom') {
            return customDelimiterEl.value || '';
        }
        return val.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
    }

    function split() {
        const input = inputEl.value;

        if (!input) {
            outputEl.textContent = 'Please enter text to split';
            return;
        }

        try {
            let parts;

            if (delimiterEl.value === 'regex') {
                const pattern = customDelimiterEl.value.trim();
                if (!pattern) {
                    outputEl.textContent = 'Please enter a regex pattern';
                    return;
                }
                parts = input.split(new RegExp(pattern, 'g'));
            } else {
                const delimiter = getDelimiter();
                parts = input.split(delimiter);
            }

            if (trimItemsEl.checked) {
                parts = parts.map(p => p.trim());
            }

            // Remove empty parts if trimming resulted in empty strings
            parts = parts.filter(p => p !== '');

            const count = parts.length;
            let result = 'Found ' + count + ' part' + (count !== 1 ? 's' : '') + ':\n\n';
            parts.forEach((part, i) => {
                result += (i + 1) + '. ' + part + '\n';
            });

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        customDelimiterEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    // Show/hide custom delimiter input
    delimiterEl.addEventListener('change', () => {
        if (delimiterEl.value === 'custom' || delimiterEl.value === 'regex') {
            customDelimiterGroup.classList.remove('hidden');
        } else {
            customDelimiterGroup.classList.add('hidden');
        }
    });

    splitBtn.addEventListener('click', split);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
