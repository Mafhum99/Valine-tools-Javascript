/**
 * Modulo Calculator
 * Calculate modulo (remainder)
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Modulo Calculator', icon: '➗' });
    
    // Get elements
    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    function calculate() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter: a,b (e.g., 17,5)';
            return;
        }

        try {
            // Parse "a,b" or "a b" or "a,b"
            const parts = input.split(/[,;\s]+/).map(s => s.trim()).filter(s => s);

            if (parts.length < 2) {
                outputEl.textContent = 'Format: a,b (e.g., 17,5)';
                return;
            }

            const a = parseFloat(parts[0]);
            const b = parseFloat(parts[1]);

            if (isNaN(a) || isNaN(b)) {
                outputEl.textContent = 'Both values must be numbers';
                return;
            }

            if (b === 0) {
                outputEl.textContent = 'Error: Division by zero';
                return;
            }

            const result = a % b;

            const output = [
                `${a} mod ${b} = ${result}`,
                `Quotient: ${Math.floor(a / b)}`,
                `Remainder: ${result}`,
                `Verification: ${Math.floor(a / b)} * ${b} + ${result} = ${Math.floor(a / b) * b + result}`
            ].join('\n');

            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }
    
    // Clear function
    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }
    
    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
    
    // Enter key support
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculate();
        }
    });
});
