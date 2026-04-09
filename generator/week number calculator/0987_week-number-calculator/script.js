/**
 * Week Number Calculator
 * Get week number from date
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Week Number Calculator', icon: '📊' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const date = new Date(inputEl.value);
    if (isNaN(date)) { outputEl.textContent = 'Please select a date'; return; }
    
    // ISO week number calculation
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    // Day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Quarter
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    outputEl.textContent = 'Date: ' + date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' (' + dayOfWeek + ')\n\n' +
      'Week Number: ' + weekNum + ' of 52\n' +
      'Day of Year: ' + dayOfYear + ' of ' + (date.getFullYear() % 4 === 0 ? 366 : 365) + '\n' +
      'Quarter: Q' + quarter + '\n\n' +
      'Days remaining in year: ' + ((date.getFullYear() % 4 === 0 ? 366 : 365) - dayOfYear);
    
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
