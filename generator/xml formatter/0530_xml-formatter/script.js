/**
 * 530 - XML Formatter
 * Formats and beautifies XML data
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'XML Formatter', icon: '📄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function formatXML(xml, indentSize = 2) {
        const indent = ' '.repeat(indentSize);
        let formatted = '';
        let level = 0;
        let inCDATA = false;

        // Split XML into tokens
        const tokens = xml
            .replace(/>\s*</g, '><')
            .match(/(<[^>]+>|[^<]+)/g);

        if (!tokens) return xml;

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];

            // Handle CDATA sections
            if (token.startsWith('<![CDATA[')) {
                inCDATA = true;
                formatted += indent.repeat(level) + token.trim() + '\n';
                if (token.endsWith(']]>')) inCDATA = false;
                continue;
            }

            if (inCDATA) {
                formatted += token + '\n';
                if (token.endsWith(']]>')) inCDATA = false;
                continue;
            }

            // Skip whitespace-only tokens
            if (token.trim() === '') continue;

            // Closing tag
            if (token.match(/^<\//)) {
                level--;
                formatted += indent.repeat(level) + token.trim() + '\n';
            }
            // Self-closing tag
            else if (token.match(/^<\?xml/) || token.match(/\/>$/) || token.match(/^<!/)) {
                formatted += indent.repeat(level) + token.trim() + '\n';
            }
            // Opening tag
            else if (token.match(/^<[^!]/)) {
                formatted += indent.repeat(level) + token.trim() + '\n';
                // Check if it's not a self-closing tag and has content
                if (!token.match(/\/>$/) && !token.match(/^<\?/)) {
                    const nextToken = tokens[i + 1];
                    if (nextToken && !nextToken.match(/^<\//)) {
                        level++;
                    }
                }
            }
            // Text content
            else {
                const text = token.trim();
                if (text) {
                    formatted += indent.repeat(level) + text + '\n';
                }
            }
        }

        return formatted.trim();
    }

    function minifyXML(xml) {
        return xml
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter XML data'; return; }

        try {
            // Validate XML first
            const parser = new DOMParser();
            const doc = parser.parseFromString(input, 'text/xml');
            const parseError = doc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Invalid XML');
            }

            const formatted = formatXML(input);
            const minified = minifyXML(input);

            let output = '═══ Formatted XML ═══\n\n';
            output += formatted;
            output += `\n\n═══ Stats ═══\n\n`;
            output += `Original length: ${input.length} chars\n`;
            output += `Formatted length: ${formatted.length} chars\n`;
            output += `Minified length: ${minified.length} chars`;
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
