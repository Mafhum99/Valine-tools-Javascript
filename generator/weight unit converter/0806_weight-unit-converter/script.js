/**
 * Weight Unit Converter
 * Convert between different weight/mass units
 */
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Weight Unit Converter', icon: '⚖️' });

    const inputEl = $('#inputValue');
    const fromEl = $('#fromUnit');
    const toEl = $('#toUnit');
    const outputEl = $('#output');
    const convertBtn = $('#convert');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // All units relative to kilograms
    const units = {
        'kilogram': { name: 'Kilogram (kg)', factor: 1 },
        'gram': { name: 'Gram (g)', factor: 0.001 },
        'milligram': { name: 'Milligram (mg)', factor: 1e-6 },
        'microgram': { name: 'Microgram (μg)', factor: 1e-9 },
        'metric_ton': { name: 'Metric Ton (t)', factor: 1000 },
        'pound': { name: 'Pound (lb)', factor: 0.45359237 },
        'ounce': { name: 'Ounce (oz)', factor: 0.028349523125 },
        'stone': { name: 'Stone (st)', factor: 6.35029318 },
        'us_ton': { name: 'US Ton (short ton)', factor: 907.18474 },
        'imperial_ton': { name: 'Imperial Ton (long ton)', factor: 1016.0469088 },
        'carats': { name: 'Carats (ct)', factor: 0.0002 }
    };

    Object.entries(units).forEach(([key, val]) => {
        fromEl.innerHTML += `<option value="${key}">${val.name}</option>`;
        toEl.innerHTML += `<option value="${key}">${val.name}</option>`;
    });
    fromEl.value = 'kilogram';
    toEl.value = 'pound';

    function convert() {
        const val = parseFloat(inputEl.value.trim());
        if (isNaN(val)) { outputEl.textContent = 'Error: Please enter a valid number.'; return; }

        const fromFactor = units[fromEl.value].factor;
        const toFactor = units[toEl.value].factor;
        const kg = val * fromFactor;
        const result = kg / toFactor;

        outputEl.innerHTML = `${formatNumber(val, 6)} ${units[fromEl.value].name} = ${formatNumber(result, 6)} ${units[toEl.value].name}\n\nSteps:\n1. To kg: ${formatNumber(val, 6)} × ${fromFactor} = ${formatNumber(kg, 6)} kg\n2. To target: ${formatNumber(kg, 6)} ÷ ${toFactor} = ${formatNumber(result, 6)}\n\nResult: ${formatNumber(result, 6)} ${units[toEl.value].name}`;
    }

    convertBtn.addEventListener('click', convert);
    clearBtn.addEventListener('click', () => { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); });
    copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') convert(); });
});
