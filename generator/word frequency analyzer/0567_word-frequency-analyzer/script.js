/**
 * Word Frequency Analyzer
 * Analyze word frequency in text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Word Frequency Analyzer', icon: '\uD83D\uDCCA' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const minLengthEl = $('#minLength');
    const sortByEl = $('#sortBy');
    const excludeCommonEl = $('#excludeCommon');
    const analyzeBtn = $('#analyze');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const uniqueCountEl = $('#uniqueCount');

    const commonWords = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
        'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
        'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'out', 'off', 'over', 'under', 'again', 'further',
        'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
        'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
        'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
        'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or',
        'if', 'while', 'about', 'up', 'that', 'this', 'these', 'those',
        'it', 'its', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
        'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
        'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
        'who', 'whom', 'whose', 'am'
    ]);

    function analyze() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const minLength = parseInt(minLengthEl.value) || 3;
            const sortBy = sortByEl.value;
            const excludeCommon = excludeCommonEl.checked;

            // Extract words and count frequency
            const words = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
            const frequency = {};

            words.forEach(word => {
                if (word.length < minLength) return;
                if (excludeCommon && commonWords.has(word)) return;
                frequency[word] = (frequency[word] || 0) + 1;
            });

            // Sort
            let sorted = Object.entries(frequency);
            if (sortBy === 'frequency') {
                sorted.sort((a, b) => b[1] - a[1]);
            } else {
                sorted.sort((a, b) => a[0].localeCompare(b[0]));
            }

            uniqueCountEl.textContent = sorted.length;

            if (sorted.length === 0) {
                outputEl.textContent = 'No words match the current filters';
                return;
            }

            const maxCount = sorted[0][1];

            let result = '';
            const maxDisplay = 100;
            const displayItems = sorted.slice(0, maxDisplay);

            displayItems.forEach(([word, count]) => {
                const bar = '\u2588'.repeat(Math.max(1, Math.round((count / maxCount) * 20)));
                const pct = ((count / words.length) * 100).toFixed(1);
                result += `${word.padEnd(20)} ${String(count).padStart(5)} (${pct}%) ${bar}\n`;
            });

            if (sorted.length > maxDisplay) {
                result += `\n... and ${sorted.length - maxDisplay} more words`;
            }

            result += `\n\nTotal words analyzed: ${words.length}`;
            result += `\nUnique words (filtered): ${sorted.length}`;

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        uniqueCountEl.textContent = '0';
        inputEl.focus();
    }

    analyzeBtn.addEventListener('click', analyze);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('input', debounce(analyze, 500));
    minLengthEl.addEventListener('change', analyze);
    sortByEl.addEventListener('change', analyze);
    excludeCommonEl.addEventListener('change', analyze);
});
