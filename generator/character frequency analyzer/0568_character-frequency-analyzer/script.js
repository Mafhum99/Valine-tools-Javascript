/**
 * Character Frequency Analyzer
 * Analyze character frequency in text
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Character Frequency Analyzer', icon: '\uD83D\uDCCB' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const charTypeEl = $('#charType');
    const caseSensitiveEl = $('#caseSensitive');
    const analyzeBtn = $('#analyze');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const uniqueCountEl = $('#uniqueCount');

    function analyze() {
        let text = inputEl.value;
        if (!text) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const charType = charTypeEl.value;
            const caseSensitive = caseSensitiveEl.checked;
            let filtered = '';

            for (const char of text) {
                let include = false;
                const lower = char.toLowerCase();

                switch (charType) {
                    case 'letters':
                        include = /[a-zA-Z]/.test(char);
                        break;
                    case 'all':
                        include = true;
                        break;
                    case 'vowels':
                        include = /[aeiouAEIOU]/.test(char);
                        break;
                    case 'consonants':
                        include = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(char);
                        break;
                }

                if (include) {
                    filtered += caseSensitive ? char : lower;
                }
            }

            // Count frequency
            const frequency = {};
            let total = 0;

            for (const char of filtered) {
                frequency[char] = (frequency[char] || 0) + 1;
                total++;
            }

            // Sort by frequency
            const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
            uniqueCountEl.textContent = sorted.length;

            if (sorted.length === 0) {
                outputEl.textContent = 'No characters match the current filter';
                return;
            }

            const maxCount = sorted[0][1];

            let result = 'Char | Count | Percentage | Bar\n';
            result += '─'.repeat(55) + '\n';

            sorted.forEach(([char, count]) => {
                const displayChar = char === ' ' ? '(space)' : char === '\n' ? '(\\n)' : char === '\t' ? '(\\t)' : char;
                const pct = ((count / total) * 100).toFixed(1);
                const bar = '\u2588'.repeat(Math.max(1, Math.round((count / maxCount) * 25)));
                result += `${displayChar.padEnd(8)} | ${String(count).padStart(5)} | ${pct.padStart(5)}%   | ${bar}\n`;
            });

            result += `\nTotal characters: ${total}`;
            result += `\nUnique characters: ${sorted.length}`;

            // Vowel/consonant stats for letters
            if (charType === 'letters') {
                const vowels = 'aeiou';
                let vowelCount = 0, consonantCount = 0;
                for (const [char, count] of sorted) {
                    if (vowels.includes(char)) vowelCount += count;
                    else consonantCount += count;
                }
                const letterTotal = vowelCount + consonantCount;
                result += `\n\nVowels: ${vowelCount} (${((vowelCount / letterTotal) * 100).toFixed(1)}%)`;
                result += `\nConsonants: ${consonantCount} (${((consonantCount / letterTotal) * 100).toFixed(1)}%)`;
            }

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
    charTypeEl.addEventListener('change', analyze);
    caseSensitiveEl.addEventListener('change', analyze);
});
