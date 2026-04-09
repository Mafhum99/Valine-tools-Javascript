/**
 * 531 - CSV Formatter
 * Formats and beautifies CSV data
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSV Formatter', icon: '📊' });

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
                    i++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === delimiter) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        result.push(current);
        return result;
    }

    function formatCSV(csv, delimiter = ',', padding = 1) {
        const lines = csv.trim().split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return { error: 'No data found' };

        const parsed = lines.map(line => parseCSVLine(line, delimiter));
        const maxCols = Math.max(...parsed.map(row => row.length));

        // Pad rows to same length
        parsed.forEach(row => {
            while (row.length < maxCols) row.push('');
        });

        // Calculate column widths
        const colWidths = [];
        for (let col = 0; col < maxCols; col++) {
            let maxLen = 0;
            for (let row = 0; row < parsed.length; row++) {
                maxLen = Math.max(maxLen, parsed[row][col].length);
            }
            colWidths.push(maxLen + padding);
        }

        // Build formatted table
        let output = '';
        parsed.forEach((row, rowIndex) => {
            const cells = row.map((cell, colIndex) => {
                return cell.padEnd(colWidths[colIndex]);
            });
            output += cells.join(' | ') + '\n';

            // Add separator after header
            if (rowIndex === 0) {
                output += colWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
            }
        });

        return { formatted: output.trim(), rows: parsed.length, cols: maxCols };
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter CSV data'; return; }

        try {
            const result = formatCSV(input);
            if (result.error) { outputEl.textContent = 'Error: ' + result.error; return; }

            let output = '═══ Formatted CSV Table ═══\n\n';
            output += result.formatted;
            output += `\n\n═══ Stats ═══\n\n`;
            output += `Rows: ${result.rows} | Columns: ${result.cols}`;
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error formatting CSV: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
