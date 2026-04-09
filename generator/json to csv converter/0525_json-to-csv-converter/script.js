/**
 * 525 - JSON to CSV Converter
 * Converts JSON data to CSV format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'JSON to CSV Converter', icon: '🔄' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('"')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    function jsonToCSV(json) {
        let data;

        // Try to parse if it's a string
        if (typeof json === 'string') {
            data = JSON.parse(json);
        } else {
            data = json;
        }

        // Handle array of objects
        if (Array.isArray(data)) {
            if (data.length === 0) return 'No data';

            // Collect all unique headers
            const headersSet = new Set();
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(k => headersSet.add(k));
                }
            });
            const headers = [...headersSet];

            if (headers.length === 0) return 'No object properties found';

            // Build CSV
            let csv = headers.join(',') + '\n';
            data.forEach(item => {
                const row = headers.map(h => {
                    let value = item[h];
                    if (typeof value === 'object' && value !== null) {
                        value = JSON.stringify(value);
                    }
                    return escapeCSV(value);
                });
                csv += row.join(',') + '\n';
            });

            return csv.trim();
        }

        // Handle single object
        if (typeof data === 'object' && data !== null) {
            const headers = Object.keys(data);
            let csv = headers.join(',') + '\n';
            const row = headers.map(h => {
                let value = data[h];
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                return escapeCSV(value);
            });
            csv += row.join(',');
            return csv;
        }

        return 'Input must be a JSON array of objects or a single object';
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter JSON data'; return; }

        try {
            const csv = jsonToCSV(input);

            // Count stats
            const parsed = JSON.parse(input);
            const rows = Array.isArray(parsed) ? parsed.length : 1;
            const cols = Array.isArray(parsed) && parsed.length > 0 ? Object.keys(parsed[0] || {}).length : Object.keys(parsed || {}).length;

            let output = `═══ Conversion Stats ═══\n\n`;
            output += `Rows: ${rows} | Columns: ${cols}\n`;
            output += `CSV lines: ${csv.split('\n').length}\n\n`;
            output += `═══ CSV Output ═══\n\n`;
            output += csv;

            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message + '\n\nMake sure your input is valid JSON (array of objects or single object).';
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
