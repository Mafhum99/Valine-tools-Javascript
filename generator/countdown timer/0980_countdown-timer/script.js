/**
 * Countdown Timer
 * Countdown to a target date
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Countdown Timer', icon: '⏳' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const targetDate = new Date(inputEl.value);
    if (isNaN(targetDate)) { outputEl.textContent = 'Please select target date'; return; }
    
    if (window.countdownInterval) clearInterval(window.countdownInterval);
    
    function update() {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff <= 0) {
        outputEl.textContent = '🎉 Time\'s up!';
        clearInterval(window.countdownInterval);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      outputEl.textContent = days + ' days\n' +
        hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0') + ':' +
        seconds.toString().padStart(2, '0');
    }
    
    update();
    window.countdownInterval = setInterval(update, 1000);
    
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
