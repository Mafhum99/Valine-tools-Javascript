/**
 * Compound Interest Calculator
 * Calculate compound interest
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Compound Interest Calculator', icon: '📈' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        try {
            
    const principal = parseFloat(inputEl.value) || 0;
    const rate = parseFloat($('#rate').value) || 0;
    const time = parseInt($('#time').value) || 1;
    const compounds = parseInt($('#compounds').value) || 12;
    
    if (principal <= 0) { outputEl.textContent = 'Please enter principal amount'; return; }
    
    // Compound interest formula: A = P(1 + r/n)^(nt)
    const finalAmount = principal * Math.pow(1 + (rate / 100 / compounds), compounds * time);
    const interestEarned = finalAmount - principal;
    const simpleInterest = principal * (rate / 100) * time;
    const compoundBenefit = interestEarned - simpleInterest;
    
    outputEl.textContent = 'Principal: $' + principal.toLocaleString() + '\n' +
      'Interest Rate: ' + rate + '% per year\n' +
      'Time: ' + time + ' year(s)\n' +
      'Compounding: ' + compounds + 'x per year\n\n' +
      'Final Amount: $' + finalAmount.toFixed(2) + '\n' +
      'Interest Earned: $' + interestEarned.toFixed(2) + '\n\n' +
      'Simple Interest would be: $' + simpleInterest.toFixed(2) + '\n' +
      'Compound benefit: $' + compoundBenefit.toFixed(2) + '\n\n' +
      'Growth: ' + ((finalAmount / principal - 1) * 100).toFixed(2) + '%';
    
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '10000';
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
