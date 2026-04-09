/**
 * Age Calculator
 * Calculate exact age from birthdate
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Age Calculator', icon: '🎂' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const birthdate = new Date(inputEl.value);
    if (isNaN(birthdate)) { outputEl.textContent = 'Please select birthdate'; return; }
    
    const today = new Date();
    let years = today.getFullYear() - birthdate.getFullYear();
    let months = today.getMonth() - birthdate.getMonth();
    let days = today.getDate() - birthdate.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const diffTime = Math.abs(today - birthdate);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    // Next birthday
    let nextBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate());
    }
    const daysToNext = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    
    outputEl.textContent = '🎂 Your Age:\n\n' +
      years + ' years, ' + months + ' months, ' + days + ' days\n\n' +
      'Total:\n' +
      totalDays.toLocaleString() + ' days\n' +
      totalWeeks.toLocaleString() + ' weeks\n' +
      totalHours.toLocaleString() + ' hours\n\n' +
      '🎁 Next birthday in: ' + daysToNext + ' days';
    
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
