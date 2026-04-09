/**
 * HTML to Text Converter
 * Strip HTML tags and convert to plain text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'HTML to Text Converter', icon: '📄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter HTML to convert'; return; }
        try {
            let text = input;

            // Replace block-level elements with newlines
            text = text.replace(/<(?:p|div|li|tr|blockquote)[^>]*>/gi, '\n');
            text = text.replace(/<\/(?:p|div|li|tr|blockquote|h[1-6]|ul|ol|table|thead|tbody|tfoot|section|article|header|footer|nav|aside|main|figure|figcaption|details|summary|form|fieldset|address|pre|hr)>/gi, '\n');

            // Handle headings
            text = text.replace(/<h([1-6])[^>]*>/gi, (match, level) => {
                return '\n' + '#'.repeat(parseInt(level)) + ' ';
            });

            // Replace <br> and <br/> with newlines
            text = text.replace(/<br\s*\/?>/gi, '\n');

            // Replace <hr> with separator
            text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

            // Remove all remaining HTML tags
            text = text.replace(/<[^>]+>/g, '');

            // Decode HTML entities
            text = text.replace(/&nbsp;/g, ' ');
            text = text.replace(/&amp;/g, '&');
            text = text.replace(/&lt;/g, '<');
            text = text.replace(/&gt;/g, '>');
            text = text.replace(/&quot;/g, '"');
            text = text.replace(/&#39;/g, "'");
            text = text.replace(/&apos;/g, "'");
            text = text.replace(/&#(\d+);/g, (match, code) => String.fromCharCode(parseInt(code, 10)));
            text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

            // Clean up whitespace
            text = text.replace(/[ \t]+/g, ' ');
            text = text.replace(/\n{3,}/g, '\n\n');
            text = text.split('\n').map(l => l.trim()).join('\n').trim();

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
