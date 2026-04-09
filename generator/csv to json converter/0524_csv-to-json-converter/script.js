/**
 * 524 - CSV to JSON Converter
 * Converts CSV data to JSON format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSV to JSON Converter', icon: '🔄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function parseCSVLine(line, delimiter = ',') {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === delimiter) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        result.push(current.trim());
        return result;
    }

    function csvToJson(csv, delimiter = ',') {
        const lines = csv.trim().split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return { error: 'No data found' };

        const headers = parseCSVLine(lines[0], delimiter);
        const records = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i], delimiter);
            const record = {};
            headers.forEach((header, j) => {
                let value = values[j] || '';
                // Try to convert to number
                if (value !== '' && !isNaN(value) && !isNaN(parseFloat(value))) {
                    value = parseFloat(value);
                }
                // Try to convert boolean
                if (value.toLowerCase() === 'true') value = true;
                if (value.toLowerCase() === 'false') value = false;
                record[header] = value;
            });
            records.push(record);
        }

        return { headers, records };
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter CSV data'; return; }

        try {
            const result = csvToJson(input);
            if (result.error) { outputEl.textContent = 'Error: ' + result.error; return; }

            // Array of objects format
            const jsonArray = JSON.stringify(result.records, null, 2);

            // Object with headers as keys
            const objFormat = {};
            result.headers.forEach(h => {
                objFormat[h] = result.records.map(r => r[h]);
            });
            const jsonByCol = JSON.stringify(objFormat, null, 2);

            // Stats
            let output = `═══ Conversion Stats ═══\n\n`;
            output += `Rows: ${result.records.length} | Columns: ${result.headers.length}\n`;
            output += `Headers: ${result.headers.join(', ')}\n\n`;
            output += `═══ Array of Objects (JSON) ═══\n\n`;
            output += jsonArray;
            output += `\n\n═══ Column-based (JSON) ═══\n\n`;
            output += jsonByCol;

            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error parsing CSV: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
