/**
 * 522 - Roman Numeral Converter
 * Converts between Roman numerals and Arabic numbers
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Roman Numeral Converter', icon: '🏛️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function toRoman(num) {
        if (num <= 0 || num > 3999) return null;
        const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
        const symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
        let result = '';
        for (let i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                result += symbols[i];
                num -= values[i];
            }
        }
        return result;
    }

    function fromRoman(roman) {
        const map = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };
        let result = 0;
        for (let i = 0; i < roman.length; i++) {
            const current = map[roman[i]];
            const next = map[roman[i + 1]];
            if (next && current < next) {
                result -= current;
            } else {
                result += current;
            }
        }
        return result;
    }

    function isValidRoman(roman) {
        return /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(roman) && roman.length > 0;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter a number or Roman numeral'; return; }

        // Check if input is a number
        const num = parseInt(input, 10);
        // Check if input is a Roman numeral
        const upperInput = input.toUpperCase();

        let result = '';

        if (!isNaN(num) && input.match(/^\d+$/)) {
            // Input is a number - convert to Roman
            if (num <= 0 || num > 3999) {
                outputEl.textContent = 'Number must be between 1 and 3999 for Roman numeral conversion.';
                return;
            }
            const roman = toRoman(num);
            result += `═══ Number to Roman ═══\n\n`;
            result += `${num} = ${roman}\n\n`;
            result += `═══ Breakdown ═══\n\n`;
            const breakdown = [];
            let temp = num;
            const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
            const symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
            for (let i = 0; i < values.length; i++) {
                while (temp >= values[i]) {
                    breakdown.push(`${symbols[i]} = ${values[i]}`);
                    temp -= values[i];
                }
            }
            result += breakdown.join('\n');
        } else if (isValidRoman(upperInput)) {
            // Input is a Roman numeral - convert to number
            const number = fromRoman(upperInput);
            result += `═══ Roman to Number ═══\n\n`;
            result += `${upperInput} = ${number}\n\n`;
            result += `═══ Breakdown ═══\n\n`;
            const map = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };
            const breakdown = [];
            for (let i = 0; i < upperInput.length; i++) {
                const current = map[upperInput[i]];
                const next = map[upperInput[i + 1]];
                if (next && current < next) {
                    breakdown.push(`${upperInput[i]} = -${current} (subtractive)`);
                } else {
                    breakdown.push(`${upperInput[i]} = ${current}`);
                }
            }
            result += breakdown.join('\n');
        } else {
            outputEl.textContent = 'Please enter a valid number (1-3999) or Roman numeral (I, V, X, L, C, D, M)';
            return;
        }

        outputEl.textContent = result;
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
