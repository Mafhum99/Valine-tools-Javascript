/**
 * Regex Builder
 * Build regex from user criteria
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Regex Builder', icon: '\uD83D\uDD27' });

    const matchTypeEl = $('#matchType');
    const searchTextEl = $('#searchText');
    const customCharsEl = $('#customChars');
    const textInput = $('#textInput');
    const customCharInput = $('#customCharInput');
    const caseSensitiveEl = $('#caseSensitive');
    const globalMatchEl = $('#globalMatch');
    const buildBtn = $('#build');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');
    const testTextEl = $('#testText');
    const testResultEl = $('#testResult');

    const builtInPatterns = {
        email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        url: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*',
        phone: '\\b(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?(\\d{3})\\)?[-.\\s]?)?\\d{3}[-.\\s]?\\d{4}\\b',
        number: '-?\\b\\d+(?:\\.\\d+)?\\b',
        date: '\\b(?:0?[1-9]|1[0-2])[\\/\\-](?:0?[1-9]|[12]\\d|3[01])[\\/\\-](?:19|20)?\\d{2}\\b',
        ip: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
        hex: '#(?:[0-9a-fA-F]{3}){1,2}\\b'
    };

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    matchTypeEl.addEventListener('change', () => {
        const type = matchTypeEl.value;
        textInput.style.display = (type === 'custom') ? 'none' : 'block';
        customCharInput.style.display = (type === 'custom') ? 'block' : 'none';
    });

    function buildRegex() {
        try {
            const type = matchTypeEl.value;
            let pattern = '';

            if (type === 'custom') {
                pattern = '[' + customCharsEl.value + ']+';
            } else if (builtInPatterns[type]) {
                pattern = builtInPatterns[type];
            } else {
                const text = searchTextEl.value;
                if (!text) {
                    outputEl.textContent = 'Please enter text to match';
                    return;
                }
                const escaped = escapeRegex(text);

                switch (type) {
                    case 'literal':
                        pattern = escaped;
                        break;
                    case 'word':
                        pattern = '\\b' + escaped + '\\b';
                        break;
                    case 'startswith':
                        pattern = '^' + escaped;
                        break;
                    case 'endswith':
                        pattern = escaped + '$';
                        break;
                    case 'contains':
                        pattern = '.*' + escaped + '.*';
                        break;
                    default:
                        pattern = escaped;
                }
            }

            let flags = '';
            if (!caseSensitiveEl.checked) flags += 'i';
            if (globalMatchEl.checked) flags += 'g';

            const regex = '/' + pattern + '/' + flags;
            outputEl.textContent = regex;

            // Auto-test if test text exists
            testRegex(pattern, flags);
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function testRegex(pattern, flags) {
        const testText = testTextEl.value;
        if (!testText || !pattern) {
            testResultEl.textContent = '';
            return;
        }
        try {
            const regex = new RegExp(pattern, flags);
            const matches = testText.match(regex);
            if (matches) {
                testResultEl.innerHTML = '<span style="color:#16a34a;">&#10003; ' + matches.length + ' match(es) found:</span> ' + matches.map(m => '<mark style="background:#fef08a;">' + escapeHtml(m) + '</mark>').join(', ');
            } else {
                testResultEl.innerHTML = '<span style="color:#dc2626;">&#10007; No matches found</span>';
            }
        } catch (e) {
            testResultEl.innerHTML = '<span style="color:#dc2626;">Invalid regex: ' + escapeHtml(e.message) + '</span>';
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function clear() {
        searchTextEl.value = '';
        customCharsEl.value = '';
        testTextEl.value = '';
        outputEl.textContent = '-';
        testResultEl.textContent = '';
        searchTextEl.focus();
    }

    buildBtn.addEventListener('click', buildRegex);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    searchTextEl.addEventListener('input', debounce(buildRegex, 300));
    customCharsEl.addEventListener('input', debounce(buildRegex, 300));
    testTextEl.addEventListener('input', debounce(() => {
        const type = matchTypeEl.value;
        if (builtInPatterns[type]) {
            testRegex(builtInPatterns[type], caseSensitiveEl.checked ? 'g' : 'gi');
        } else if (searchTextEl.value) {
            buildRegex();
        }
    }, 300));
});
