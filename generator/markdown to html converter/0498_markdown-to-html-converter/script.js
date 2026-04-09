/**
 * Markdown to HTML Converter
 * Convert Markdown syntax to HTML
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Markdown to HTML Converter', icon: '📑' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function processInline(text) {
        // Escape HTML first
        text = escapeHtml(text);

        // Images: ![alt](url)
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Links: [text][ref]
        text = text.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, '<a href="#ref-$2">$1</a>');

        // Bold: **text** or __text__
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.+?)_/g, '<em>$1</em>');

        // Bold and italic: ***text*** or ___text___
        text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

        // Strikethrough: ~~text~~
        text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Inline code: `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Highlight: ==text==
        text = text.replace(/==(.+?)==/g, '<mark>$1</mark>');

        // Subscript: ~text~
        text = text.replace(/~(.+?)~/g, '<sub>$1</sub>');

        // Superscript: ^text^
        text = text.replace(/\^([^\^]+)\^/g, '<sup>$1</sup>');

        // Line break (two spaces at end)
        text = text.replace(/  $/gm, '<br>');

        return text;
    }

    function calculate() {
        const input = inputEl.value;
        if (!input.trim()) { outputEl.textContent = 'Please enter Markdown to convert'; return; }
        try {
            const lines = input.split('\n');
            let html = '';
            let inCodeBlock = false;
            let codeContent = '';
            let codeLang = '';
            let inList = false;
            let listType = '';
            let inBlockquote = false;
            let blockquoteContent = '';

            function closeList() {
                if (inList) { html += `</${listType}>\n`; inList = false; listType = ''; }
            }

            function closeBlockquote() {
                if (inBlockquote) {
                    html += `<blockquote>\n${blockquoteContent}</blockquote>\n`;
                    inBlockquote = false;
                    blockquoteContent = '';
                }
            }

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Fenced code blocks
                if (line.trim().startsWith('```')) {
                    if (!inCodeBlock) {
                        closeList();
                        closeBlockquote();
                        inCodeBlock = true;
                        codeLang = line.trim().substring(3).trim();
                        codeContent = '';
                    } else {
                        const langClass = codeLang ? ` class="language-${codeLang}"` : '';
                        html += `<pre><code${langClass}>${escapeHtml(codeContent.trim())}</code></pre>\n`;
                        inCodeBlock = false;
                        codeContent = '';
                        codeLang = '';
                    }
                    continue;
                }

                if (inCodeBlock) {
                    codeContent += line + '\n';
                    continue;
                }

                // Empty line
                if (line.trim() === '') {
                    closeList();
                    closeBlockquote();
                    continue;
                }

                // Headings
                const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
                if (headingMatch) {
                    closeList();
                    closeBlockquote();
                    const level = headingMatch[1].length;
                    html += `<h${level}>${processInline(headingMatch[2])}</h${level}>\n`;
                    continue;
                }

                // Horizontal rule
                if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
                    closeList();
                    closeBlockquote();
                    html += '<hr>\n';
                    continue;
                }

                // Blockquote
                if (line.trim().startsWith('>')) {
                    closeList();
                    if (!inBlockquote) inBlockquote = true;
                    blockquoteContent += `<p>${processInline(line.trim().substring(1).trim())}</p>\n`;
                    continue;
                } else if (inBlockquote) {
                    closeBlockquote();
                }

                // Unordered list
                const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
                if (ulMatch) {
                    closeBlockquote();
                    if (!inList || listType !== 'ul') { closeList(); html += '<ul>\n'; inList = true; listType = 'ul'; }
                    html += `  <li>${processInline(ulMatch[1])}</li>\n`;
                    continue;
                }

                // Ordered list
                const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
                if (olMatch) {
                    closeBlockquote();
                    if (!inList || listType !== 'ol') { closeList(); html += '<ol>\n'; inList = true; listType = 'ol'; }
                    html += `  <li>${processInline(olMatch[1])}</li>\n`;
                    continue;
                }

                // Close list if we're in one
                closeList();

                // Paragraph
                html += `<p>${processInline(line)}</p>\n`;
            }

            // Close any remaining open blocks
            if (inCodeBlock) {
                const langClass = codeLang ? ` class="language-${codeLang}"` : '';
                html += `<pre><code${langClass}>${escapeHtml(codeContent.trim())}</code></pre>\n`;
            }
            closeList();
            closeBlockquote();

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
