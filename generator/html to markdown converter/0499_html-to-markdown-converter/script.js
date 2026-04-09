/**
 * HTML to Markdown Converter
 * Convert HTML elements to Markdown syntax
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'HTML to Markdown Converter', icon: '📋' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter HTML to convert'; return; }
        try {
            let md = input;

            // Code blocks: <pre><code>...</code></pre>
            md = md.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
                const cleaned = code.replace(/<[^>]+>/g, '')
                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                return '```\n' + cleaned.trim() + '\n```\n';
            });

            // Inline code: <code>...</code>
            md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, code) => {
                return '`' + code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') + '`';
            });

            // Images: <img src="url" alt="text">
            md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
            md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
            md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

            // Links: <a href="url">text</a>
            md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

            // Headings: <h1>-<h6>
            for (let i = 6; i >= 1; i--) {
                const tag = `h${i}`;
                const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
                md = md.replace(regex, (match, content) => {
                    const text = content.replace(/<[^>]+>/g, '').trim();
                    return '#'.repeat(i) + ' ' + text + '\n';
                });
            }

            // Bold: <strong> or <b>
            md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');

            // Italic: <em> or <i>
            md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

            // Strikethrough: <del>, <s>, <strike>
            md = md.replace(/<(?:del|s|strike)[^>]*>([\s\S]*?)<\/(?:del|s|strike)>/gi, '~~$1~~');

            // Horizontal rule: <hr>
            md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

            // Line breaks: <br>
            md = md.replace(/<br[^>]*\/?>/gi, '  \n');

            // Paragraphs: <p>
            md = md.replace(/<p[^>]*>/gi, '\n');
            md = md.replace(/<\/p>/gi, '\n\n');

            // Blockquotes: <blockquote>
            md = md.replace(/<blockquote[^>]*>/gi, '\n');
            md = md.replace(/<\/blockquote>/gi, '\n');
            // Add > to lines within blockquote areas (simplified)
            md = md.replace(/\n{2,}/g, '\n\n');

            // Lists: <ul> and <ol>
            md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');
            md = md.replace(/<li[^>]*>/gi, '- ');
            md = md.replace(/<\/li>/gi, '\n');

            // Div, section, article, etc. - just add spacing
            md = md.replace(/<\/?(?:div|section|article|aside|header|footer|main|nav|figure|figcaption|details|summary|span|label)[^>]*>/gi, '\n');

            // Remove all remaining HTML tags
            md = md.replace(/<[^>]+>/g, '');

            // Decode HTML entities
            md = md.replace(/&nbsp;/g, ' ');
            md = md.replace(/&amp;/g, '&');
            md = md.replace(/&lt;/g, '<');
            md = md.replace(/&gt;/g, '>');
            md = md.replace(/&quot;/g, '"');
            md = md.replace(/&#39;/g, "'");
            md = md.replace(/&apos;/g, "'");
            md = md.replace(/&#(\d+);/g, (match, code) => String.fromCharCode(parseInt(code, 10)));
            md = md.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

            // Clean up whitespace
            md = md.replace(/[ \t]+/g, ' ');
            md = md.replace(/\n{3,}/g, '\n\n');
            md = md.split('\n').map(l => l.trim()).join('\n').trim();

            outputEl.textContent = md;
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
