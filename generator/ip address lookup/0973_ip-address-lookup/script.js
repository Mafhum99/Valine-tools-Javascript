/**
 * IP Address Lookup
 * Parse and analyze IP address
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'IP Address Lookup', icon: '🔍' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const ip = inputEl.value.trim();
    if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      outputEl.textContent = 'Please enter valid IP address';
      return;
    }
    
    const parts = ip.split('.').map(Number);
    if (parts.some(p => p < 0 || p > 255)) {
      outputEl.textContent = 'Invalid IP: octets must be 0-255';
      return;
    }
    
    const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('.');
    const hex = parts.map(p => p.toString(16).padStart(2, '0')).join('.');
    
    let ipClass = 'Class A';
    if (parts[0] >= 192 && parts[0] < 224) ipClass = 'Class C';
    else if (parts[0] >= 128 && parts[0] < 192) ipClass = 'Class B';
    else if (parts[0] >= 224 && parts[0] < 240) ipClass = 'Class D (Multicast)';
    else if (parts[0] >= 240) ipClass = 'Class E (Reserved)';
    
    const isPrivate = (parts[0] === 10) || 
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168);
    
    const isLoopback = parts[0] === 127;
    
    outputEl.textContent = 'IP Address: ' + ip + '\n\n' +
      'Class: ' + ipClass + '\n' +
      'Type: ' + (isPrivate ? 'Private' : isLoopback ? 'Loopback' : 'Public') + '\n\n' +
      'Binary: ' + binary + '\n' +
      'Hexadecimal: ' + hex + '\n' +
      'Decimal: ' + (ipNum >>> 0);
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', () => { calculate(); });
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && true) calculate();
    });
});
