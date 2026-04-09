/**
 * Random Number Generator
 * Generate random numbers in a range
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Random Number Generator', icon: '🎲' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const min = parseInt($('#min').value);
    const max = parseInt($('#max').value);
    const count = parseInt($('#count').value) || 1;
    
    if (isNaN(min) || isNaN(max)) { outputEl.textContent = 'Please enter valid numbers'; return; }
    if (min >= max) { outputEl.textContent = 'Min must be less than max'; return; }
    if (count < 1 || count > 50) { outputEl.textContent = 'Count must be 1-50'; return; }
    
    const numbers = [];
    const array = new Uint32Array(count);
    crypto.getRandomValues(array);
    for (let i = 0; i < count; i++) {
      numbers.push(array[i] % (max - min + 1) + min);
    }
    outputEl.textContent = numbers.join(', ');
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '1';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', () => { calculate(););
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && true) calculate();
    });
});
