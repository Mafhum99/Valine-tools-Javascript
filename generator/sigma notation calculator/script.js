const $ = (selector) => document.querySelector(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

function showToast(message) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; }, 2000);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    }
}

function evaluateExpression(expr, n) {
    let safeExpr = expr.toLowerCase()
        .replace(/(\d)(n)/g, '$1*$2')
        .replace(/(n)(\d)/g, '$1*$2')
        .replace(/n\^(\d+)/g, 'Math.pow(n, $1)')
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

    try {
        const func = new Function('n', `return ${safeExpr};`);
        const result = func(n);
        return isFinite(result) ? result : 0;
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

function calculate() {
    const expr = $('#expression').value.trim();
    const start = parseInt($('#start').value);
    const end = parseInt($('#end').value);

    if (!expr) {
        showToast('Please enter an expression');
        return;
    }

    if (isNaN(start) || isNaN(end)) {
        showToast('Please enter valid bounds');
        return;
    }

    if (start > end) {
        showToast('Start must be <= End');
        return;
    }

    if (end - start > 10000) {
        showToast('Range too large (max 10,000)');
        return;
    }

    let sum = 0;
    let terms = [];
    try {
        for (let n = start; n <= end; n++) {
            const val = evaluateExpression(expr, n);
            sum += val;
            if (terms.length < 15) terms.push(val.toFixed(2).replace(/\.00$/, ''));
        }
    } catch (e) {
        showToast('Error in expression');
        return;
    }

    const output = $('#output');
    output.innerHTML = '';
    const container = createElement('div', { className: 'mt-2' });
    
    container.appendChild(createElement('div', { 
        innerHTML: `<strong>Sum (Σ):</strong> <span style="color:var(--primary); font-size:1.4rem;">${sum.toLocaleString()}</span>` 
    }));
    
    container.appendChild(createElement('div', { 
        textContent: `Terms: ${end - start + 1} | Avg: ${(sum / (end - start + 1)).toLocaleString()}`,
        className: 'text-muted mt-1'
    }));

    if (terms.length > 0) {
        container.appendChild(createElement('div', { 
            textContent: 'Sequence: ' + terms.join(', ') + (end - start + 1 > 15 ? '...' : ''),
            className: 'mt-1',
            style: 'font-size:0.85rem; color:var(--gray-600);'
        }));
    }

    output.appendChild(container);
}

$('#action-btn').addEventListener('click', calculate);
$('#clear-btn').addEventListener('click', () => {
    $('#expression').value = 'n';
    $('#start').value = '1';
    $('#end').value = '10';
    $('#output').textContent = 'Enter parameters and click Calculate.';
});
$('#copy-btn').addEventListener('click', () => {
    const text = $('#output').innerText;
    if (text && !text.includes('Enter parameters')) copyToClipboard(text);
});
