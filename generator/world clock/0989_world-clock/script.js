/**
 * World Clock
 * View time in different cities
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'World Clock', icon: '🌐' });

    const inputEl = $('#calculate');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const cities = [
      { name: 'New York', tz: 'America/New_York' },
      { name: 'London', tz: 'Europe/London' },
      { name: 'Paris', tz: 'Europe/Paris' },
      { name: 'Jakarta', tz: 'Asia/Jakarta' },
      { name: 'Singapore', tz: 'Asia/Singapore' },
      { name: 'Tokyo', tz: 'Asia/Tokyo' },
      { name: 'Sydney', tz: 'Australia/Sydney' },
      { name: 'Dubai', tz: 'Asia/Dubai' }
    ];
    
    function updateClocks() {
      let result = '🌍 World Clock\n\n';
      const now = new Date();
      
      cities.forEach(city => {
        const time = now.toLocaleString('en-US', { 
          timeZone: city.tz, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: true 
        });
        result += city.name + ': ' + time + '\n';
      });
      
      outputEl.textContent = result;
    }
    
    updateClocks();
    if (!window.worldClockInterval) {
      window.worldClockInterval = setInterval(updateClocks, 1000);
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
