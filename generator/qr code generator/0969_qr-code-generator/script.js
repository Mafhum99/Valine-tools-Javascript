/**
 * QR Code Generator
 * Generate QR code data
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'QR Code Generator', icon: '📱' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const input = inputEl.value.trim();
    if (!input) { outputEl.textContent = 'Please enter text or URL'; return; }
    
    // Generate QR-like encoded data (simplified)
    let encoded = 'QR_ENCODED: ' + encodeURIComponent(input);
    encoded += '\n\nLength: ' + input.length + ' characters';
    encoded += '\nType: ' + (input.startsWith('http') ? 'URL' : 'Text');
    encoded += '\n\nFor actual QR image, use a QR code library';
    outputEl.textContent = encoded;
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', () => { calculate(););
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) calculate();
    });
});
