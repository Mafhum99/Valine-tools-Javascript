/**
 * Pomodoro Timer
 * Pomodoro technique timer
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Pomodoro Timer', icon: '🍅' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const workMin = parseInt(inputEl.value) || 25;
    const breakMin = parseInt($('#breakDuration').value) || 5;
    
    if (window.pomoInterval) clearInterval(window.pomoInterval);
    
    let timeLeft = workMin * 60;
    let isWork = true;
    let sessions = 0;
    
    function update() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const phase = isWork ? '🍅 Work' : '☕ Break';
      
      outputEl.textContent = phase + '\n' +
        minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0') + '\n\n' +
        'Sessions completed: ' + sessions;
      
      if (timeLeft <= 0) {
        if (isWork) {
          sessions++;
          timeLeft = breakMin * 60;
        } else {
          timeLeft = workMin * 60;
        }
        isWork = !isWork;
      }
      timeLeft--;
    }
    
    update();
    window.pomoInterval = setInterval(update, 1000);
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '25';
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
