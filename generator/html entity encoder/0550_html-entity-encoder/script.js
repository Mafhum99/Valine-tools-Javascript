/**
 * HTML Entity Encoder
 * Encode special characters to HTML entities
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'HTML Entity Encoder', icon: '\u{1F512}' });

    const inputEl = $('#input');
    const modeEl = $('#mode');
    const outputEl = $('#output');
    const processBtn = $('#process');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Common HTML entities map
    const ENTITY_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#96;',
        '=': '&#61;'
    };

    const REVERSE_MAP = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/',
        '&#96;': '`',
        '&#61;': '=',
        '&apos;': "'",
        '&nbsp;': '\u00A0',
        '&copy;': '\u00A9',
        '&reg;': '\u00AE',
        '&trade;': '\u2122',
        '&mdash;': '\u2014',
        '&ndash;': '\u2013',
        '&laquo;': '\u00AB',
        '&raquo;': '\u00BB',
        '&bull;': '\u2022',
        '&hellip;': '\u2026',
        '&times;': '\u00D7',
        '&divide;': '\u00F7',
        '&plusmn;': '\u00B1'
    };

    function encodeHtml(text) {
        return text.replace(/[&<>"'\/`=]/g, char => ENTITY_MAP[char] || char);
    }

    function decodeHtml(text) {
        // First decode named and numeric entities using a temporary element
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        let result = textarea.value;

        // Also handle our custom reverse map
        const regex = new RegExp(Object.keys(REVERSE_MAP).join('|'), 'gi');
        result = result.replace(regex, match => REVERSE_MAP[match.toLowerCase()] || match);

        return result;
    }

    function process() {
        const input = inputEl.value;

        if (!input) {
            outputEl.textContent = 'Please enter text to process';
            return;
        }

        try {
            let result;
            if (modeEl.value === 'encode') {
                result = encodeHtml(input);
            } else {
                result = decodeHtml(input);
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

    processBtn.addEventListener('click', process);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
