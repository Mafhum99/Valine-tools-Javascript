/**
 * Random String Generator
 * Generate random strings
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Random String Generator', icon: '🔤' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const length = parseInt(inputEl.value);
    if (length < 1 || length > 256) { outputEl.textContent = 'Length must be 1-256'; return; }
    
    let chars = '';
    if ($('#uppercase').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if ($('#lowercase').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if ($('#numbers').checked) chars += '0123456789';
    if ($('#symbols').checked) chars += '!@#$%^&*()_+-=';
    
    if (!chars) { outputEl.textContent = 'Select at least one character type'; return; }
    
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    outputEl.textContent = result;
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '16';
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
