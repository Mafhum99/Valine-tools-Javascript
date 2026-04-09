/**
 * UUID Generator
 * Generate unique UUIDs
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'UUID Generator', icon: '🆔' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const count = parseInt(inputEl.value) || 1;
    if (count < 1 || count > 20) { outputEl.textContent = 'Please enter 1-20'; return; }
    
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID ? crypto.randomUUID() : uuidv4());
    }
    outputEl.textContent = uuids.join('\n');
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '5';
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
