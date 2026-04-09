/**
 * Factorial Calculator
 * Calculate n! for any number
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Factorial Calculator', icon: '❗' });
    
    // Get elements
    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    // Main calculation function
    function calculate() {
        const input = inputEl.value.trim();
        
        if (!input) {
            outputEl.textContent = 'Please enter a value';
            return;
        }
        
        try {
            // TODO: Implement Factorial Calculator logic here
            const result = input; // Placeholder
            outputEl.textContent = result;
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
