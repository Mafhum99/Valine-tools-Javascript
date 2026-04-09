/**
 * Cron Expression Parser
 * Parse cron expressions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Cron Expression Parser', icon: '⏰' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const cron = inputEl.value.trim();
    if (!cron) { outputEl.textContent = 'Please enter cron expression'; return; }
    
    const parts = cron.split(/\s+/);
    if (parts.length !== 5) {
      outputEl.textContent = 'Invalid: cron must have 5 fields (min hour day month weekday)';
      return;
    }
    
    const [minute, hour, day, month, weekday] = parts;
    const fieldNames = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];
    const values = [minute, hour, day, month, weekday];
    const ranges = ['0-59', '0-23', '1-31', '1-12', '0-7'];
    
    let result = 'Cron: ' + cron + '\n\nSchedule:\n';
    values.forEach((val, idx) => {
      result += fieldNames[idx] + ': ' + val + '\n';
    });
    
    // Simple interpretation
    if (cron.includes('*')) {
      result += '\nThis schedule runs ';
      if (cron === '* * * * *') result += 'every minute';
      else if (cron.includes('*/')) result += 'at regular intervals';
      else result += 'based on the specified pattern';
    }
    
    result += '\n\nFor exact execution times, use a cron scheduler library';
    outputEl.textContent = result;
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '*/15 * * * *';
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
