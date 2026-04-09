/**
 * Text to HTML Converter
 * Convert plain text to HTML with proper formatting
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Text to HTML Converter', icon: '📝' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function calculate() {
        const input = inputEl.value;
        if (!input.trim()) { outputEl.textContent = 'Please enter text to convert'; return; }
        try {
            const lines = input.split('\n');
            let html = '';
            let inList = false;
            let inParagraph = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line === '') {
                    // Close any open blocks
                    if (inList) { html += '</ul>\n'; inList = false; }
                    if (inParagraph) { html += '</p>\n'; inParagraph = false; }
                    continue;
                }

                // Check for heading pattern: # Heading
                const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
                if (headingMatch) {
                    if (inList) { html += '</ul>\n'; inList = false; }
                    if (inParagraph) { html += '</p>\n'; inParagraph = false; }
                    const level = headingMatch[1].length;
                    html += `<h${level}>${escapeHtml(headingMatch[2])}</h${level}>\n`;
                    continue;
                }

                // Check for list item pattern: - item or * item
                const listMatch = line.match(/^[-*]\s+(.+)$/);
                if (listMatch) {
                    if (inParagraph) { html += '</p>\n'; inParagraph = false; }
                    if (!inList) { html += '<ul>\n'; inList = true; }
                    html += `  <li>${escapeHtml(listMatch[1])}</li>\n`;
                    continue;
                }

                // Check for numbered list: 1. item
                const numberMatch = line.match(/^\d+\.\s+(.+)$/);
                if (numberMatch) {
                    if (inList) { html += '</ul>\n'; inList = false; }
                    if (inParagraph) { html += '</p>\n'; inParagraph = false; }
                    html += `<ol>\n  <li>${escapeHtml(numberMatch[1])}</li>\n</ol>\n`;
                    continue;
                }

                // Regular text - wrap in paragraph
                if (inList) { html += '</ul>\n'; inList = false; }
                if (!inParagraph) { html += '<p>'; inParagraph = true; }
                else { html += '<br>'; }
                html += escapeHtml(line);
            }

            // Close any remaining open blocks
            if (inParagraph) { html += '</p>\n'; }
            if (inList) { html += '</ul>\n'; }

            outputEl.textContent = html.trim();
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
