/**
 * Regex Tester
 * Test regex against input text, show matches
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Regex Tester', icon: '\uD83D\uDD2C' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const patternEl = $('#pattern');
    const flagsEl = $('#flags');
    const highlightBox = $('#highlight-box');
    const highlightOutput = $('#highlight-output');
    const testBtn = $('#test');
    const clearBtn = $('#clear');

    function testRegex() {
        const text = inputEl.value;
        const patternStr = patternEl.value.trim();

        if (!text.trim() || !patternStr) {
            outputEl.textContent = 'Please enter both text and a regex pattern';
            highlightBox.style.display = 'none';
            return;
        }

        try {
            const flags = flagsEl.value;
            const regex = new RegExp(patternStr, flags);
            const matches = [];
            let match;

            // Use exec for detailed match info (with g flag)
            if (flags.includes('g')) {
                while ((match = regex.exec(text)) !== null) {
                    matches.push({
                        value: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                    if (!match[0]) {
                        regex.lastIndex++;
                        if (regex.lastIndex > text.length) break;
                    }
                }
            } else {
                match = regex.exec(text);
                if (match) {
                    matches.push({
                        value: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            }

            if (matches.length > 0) {
                let resultText = `Found ${matches.length} match(es):\n\n`;
                matches.forEach((m, i) => {
                    resultText += `Match ${i + 1}: "${m.value}" at index ${m.index}`;
                    if (m.groups.length > 0) {
                        m.groups.forEach((g, j) => {
                            resultText += `\n  Group ${j + 1}: ${g !== undefined ? '"' + g + '"' : '(undefined)'}`;
                        });
                    }
                    resultText += '\n';
                });
                outputEl.textContent = resultText;

                // Highlight in original text
                highlightBox.style.display = 'block';
                let highlighted = '';
                let lastIndex = 0;
                matches.forEach(m => {
                    highlighted += escapeHtml(text.slice(lastIndex, m.index));
                    highlighted += '<mark style="background:#fef08a;padding:1px 2px;">' + escapeHtml(m.value) + '</mark>';
                    lastIndex = m.index + m.value.length;
                });
                highlighted += escapeHtml(text.slice(lastIndex));
                highlightOutput.innerHTML = highlighted;
            } else {
                outputEl.textContent = 'No matches found';
                highlightBox.style.display = 'none';
            }
        } catch (error) {
            outputEl.textContent = 'Invalid regex: ' + error.message;
            highlightBox.style.display = 'none';
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function clear() {
        inputEl.value = '';
        patternEl.value = '';
        outputEl.textContent = '-';
        highlightBox.style.display = 'none';
        inputEl.focus();
    }

    testBtn.addEventListener('click', testRegex);
    clearBtn.addEventListener('click', clear);
    patternEl.addEventListener('input', debounce(testRegex, 400));
    flagsEl.addEventListener('change', testRegex);
    inputEl.addEventListener('input', debounce(testRegex, 400));
});
