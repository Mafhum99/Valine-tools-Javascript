/**
 * CSV to JSON Converter
 * Convert CSV data to JSON format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSV to JSON Converter', icon: '\u{1F504}' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const convertBtn = $('#convert');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        current += '"';
                        i += 2;
                        continue;
                    } else {
                        inQuotes = false;
                        i++;
                        continue;
                    }
                } else {
                    current += char;
                    i++;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                    i++;
                } else if (char === ',') {
                    result.push(current.trim());
                    current = '';
                    i++;
                } else {
                    current += char;
                    i++;
                }
            }
        }

        result.push(current.trim());
        return result;
    }

    function csvToJSON(csv) {
        const lines = csv.trim().split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        const headers = parseCSVLine(lines[0]);
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const obj = {};

            for (let j = 0; j < headers.length; j++) {
                let value = j < values.length ? values[j] : '';

                if (value !== '' && !isNaN(value) && value.trim() !== '') {
                    const num = Number(value);
                    if (!isNaN(num)) {
                        value = num;
                    }
                }

                if (value.toLowerCase() === 'true') value = true;
                else if (value.toLowerCase() === 'false') value = false;

                obj[headers[j]] = value;
            }

            result.push(obj);
        }

        return result;
    }

    function convert() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter CSV data';
            return;
        }

        try {
            const json = csvToJSON(input);
            outputEl.textContent = JSON.stringify(json, null, 2);
        } catch (e) {
            outputEl.textContent = '\u274C Error: ' + e.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    convertBtn.addEventListener('click', convert);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }
});
