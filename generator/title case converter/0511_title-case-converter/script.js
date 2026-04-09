/**
 * 511 - Title Case Converter
 * Converts text to proper title case following style guide rules
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Title Case Converter', icon: '🔠' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Words that are not capitalized in title case (except first/last word)
    const minorWords = new Set(['a','an','the','and','but','or','nor','for','yet','so','in','on','at','to','by','up','as','if','is','it','of','do','go','no','be','he','me','my','we','us']);

    function toTitleCase(text) {
        if (!text.trim()) return '';

        const words = text.trim().split(/\s+/);
        return words.map((word, i) => {
            const isLast = i === words.length - 1;
            const lowerWord = word.toLowerCase();

            // Always capitalize first and last word
            if (i === 0 || isLast) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            // Minor words stay lowercase
            if (minorWords.has(lowerWord)) {
                return lowerWord;
            }

            // Capitalize everything else
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function toTitleCaseAP(text) {
        // AP Style: lowercase words with 3 or fewer letters
        if (!text.trim()) return '';

        const words = text.trim().split(/\s+/);
        return words.map((word, i) => {
            const isLast = i === words.length - 1;
            const lowerWord = word.toLowerCase();

            if (i === 0 || isLast) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            if (lowerWord.length <= 3) {
                return lowerWord;
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function toTitleCaseChicago(text) {
        // Chicago: lowercase articles, conjunctions, prepositions
        const chicagoMinor = new Set(['a','an','the','and','but','or','nor','for','yet','so','in','on','at','to','by','up','as','if','of','do','go','no','be','he','me','my','we','us','but','or','nor','from','into','like','near','over','past','plus','save','than','till','upon','via','with']);

        if (!text.trim()) return '';

        const words = text.trim().split(/\s+/);
        return words.map((word, i) => {
            const isLast = i === words.length - 1;
            const lowerWord = word.toLowerCase();

            if (i === 0 || isLast) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            if (chicagoMinor.has(lowerWord)) {
                return lowerWord;
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter text to convert';
            return;
        }

        let result = `═══ Standard Title Case ═══\n\n${toTitleCase(input)}\n\n`;
        result += `═══ AP Style ═══\n\n${toTitleCaseAP(input)}\n\n`;
        result += `═══ Chicago Style ═══\n\n${toTitleCaseChicago(input)}\n\n`;
        result += `═══ All Caps (for comparison) ═══\n\n${input.toUpperCase()}\n\n`;
        result += `═══ Sentence Case ═══\n\n${input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()}`;

        outputEl.textContent = result;
    }

    function clearAll() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
    inputEl.addEventListener('input', debounce(calculate, 300));
});
