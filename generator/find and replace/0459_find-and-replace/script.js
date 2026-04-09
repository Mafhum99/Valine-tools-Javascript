/**
 * Find and Replace
 * Find and replace text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Find and Replace', icon: '🔍' });

    const inputEl = $('#input');
    const findTextEl = $('#findText');
    const replaceTextEl = $('#replaceText');
    const useRegexEl = $('#useRegex');
    const caseSensitiveEl = $('#caseSensitive');
    const replaceAllEl = $('#replaceAll');
    const replaceBtn = $('#replace');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');
    const statsEl = $('#stats');

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replace() {
        const input = inputEl.value;
        const findText = findTextEl.value;
        const replaceText = replaceTextEl.value;

        if (!input) {
            outputEl.textContent = 'Please enter text to process';
            statsEl.textContent = '';
            return;
        }

        if (!findText) {
            outputEl.textContent = 'Please enter text to find';
            statsEl.textContent = '';
            return;
        }

        try {
            let pattern;
            let flags = '';

            if (useRegexEl.checked) {
                flags = replaceAllEl.checked ? 'g' : '';
                if (!caseSensitiveEl.checked) flags += 'i';
                pattern = new RegExp(findText, flags);
            } else {
                const escaped = escapeRegex(findText);
                flags = replaceAllEl.checked ? 'g' : '';
                if (!caseSensitiveEl.checked) flags += 'i';
                pattern = new RegExp(escaped, flags);
            }

            const matches = input.match(pattern);
            const matchCount = matches ? matches.length : 0;

            const result = input.replace(pattern, replaceText);
            statsEl.textContent = `${matchCount} occurrence(s) replaced`;
            outputEl.textContent = result;
        } catch (error) {
            if (error instanceof SyntaxError) {
                outputEl.textContent = 'Error: Invalid regular expression';
            } else {
                outputEl.textContent = 'Error: ' + error.message;
            }
            statsEl.textContent = '';
        }
    }

    function clear() {
        inputEl.value = '';
        findTextEl.value = '';
        replaceTextEl.value = '';
        outputEl.textContent = '-';
        statsEl.textContent = '';
        inputEl.focus();
    }

    replaceBtn.addEventListener('click', replace);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.textContent;
            if (text === '-' || text.startsWith('Please') || text.startsWith('Error')) {
                showToast('No valid result to copy');
                return;
            }
            copyToClipboard(text);
        });
    }
});
