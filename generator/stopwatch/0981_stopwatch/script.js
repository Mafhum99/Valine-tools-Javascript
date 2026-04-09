/**
 * Stopwatch
 * Simple stopwatch functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Stopwatch', icon: '⏱️' });

    const inputEl = $('#calculate');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    if (!window.swState) window.swState = { running: false, startTime: 0, elapsed: 0, interval: null };
    const sw = window.swState;
    
    function formatTime(ms) {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centiseconds = Math.floor((ms % 1000) / 10);
      return hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0') + ':' +
        seconds.toString().padStart(2, '0') + '.' +
        centiseconds.toString().padStart(2, '0');
    }
    
    if (calculateBtn.textContent.includes('Start')) {
      sw.startTime = Date.now() - sw.elapsed;
      sw.interval = setInterval(() => {
        sw.elapsed = Date.now() - sw.startTime;
        outputEl.textContent = formatTime(sw.elapsed);
      }, 10);
      calculateBtn.textContent = '⏸️ Pause';
    } else if (calculateBtn.textContent.includes('Pause')) {
      clearInterval(sw.interval);
      calculateBtn.textContent = '▶️ Resume';
    } else {
      clearInterval(sw.interval);
      sw.elapsed = 0;
      outputEl.textContent = '00:00:00.00';
      calculateBtn.textContent = '▶️ Start';
    }
    
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
