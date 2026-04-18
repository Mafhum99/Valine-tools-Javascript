// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
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
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Runge-Kutta Calculator', icon: '📊' });
    
    const funcInput = $('#function');
    const x0Input = $('#x0');
    const y0Input = $('#y0');
    const hInput = $('#h');
    const stepsInput = $('#steps');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    function calculate() {
        const fStr = funcInput.value.trim();
        const x0 = parseFloat(x0Input.value);
        const y0 = parseFloat(y0Input.value);
        const h = parseFloat(hInput.value);
        const steps = parseInt(stepsInput.value);
        
        if (!fStr) {
            outputEl.textContent = 'Please enter a function f(x, y).';
            return;
        }
        if (isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(steps)) {
            outputEl.textContent = 'Please enter valid numerical values.';
            return;
        }
        if (h <= 0) {
            outputEl.textContent = 'Step size (h) must be positive.';
            return;
        }
        if (steps < 1 || steps > 1000) {
            outputEl.textContent = 'Number of steps should be between 1 and 1000.';
            return;
        }

        let f;
        try {
            // Using new Function for evaluation. 
            // Warning: Potential security risk if user inputs malicious code, but this is a client-side calculator.
            f = new Function('x', 'y', `return (${fStr});`);
            // Test call
            f(x0, y0);
        } catch (e) {
            outputEl.textContent = 'Error in function: ' + e.message;
            return;
        }

        let x = x0;
        let y = y0;
        const results = [{ step: 0, x: x.toFixed(6), y: y.toFixed(6) }];

        try {
            for (let i = 1; i <= steps; i++) {
                let k1 = h * f(x, y);
                let k2 = h * f(x + h / 2, y + k1 / 2);
                let k3 = h * f(x + h / 2, y + k2 / 2);
                let k4 = h * f(x + h, y + k3);

                y = y + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
                x = x + h;

                results.push({ step: i, x: x.toFixed(6), y: y.toFixed(6) });
            }
        } catch (e) {
            outputEl.textContent = 'Error during calculation: ' + e.message;
            return;
        }

        // Render table
        let tableHTML = `
            <div class="scrollable-table">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Step</th>
                            <th>x</th>
                            <th>y</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        results.forEach(res => {
            tableHTML += `
                <tr>
                    <td>${res.step}</td>
                    <td>${res.x}</td>
                    <td>${res.y}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        outputEl.innerHTML = tableHTML;
    }
    
    function clear() {
        funcInput.value = 'x + y';
        x0Input.value = '0';
        y0Input.value = '1';
        hInput.value = '0.1';
        stepsInput.value = '10';
        outputEl.textContent = '-';
        funcInput.focus();
    }
    
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', () => {
        if (outputEl.textContent !== '-') {
            // Get text content of table rows
            const rows = Array.from($$('.result-table tr')).map(row => 
                Array.from(row.cells).map(cell => cell.textContent).join('\t')
            ).join('\n');
            copyToClipboard(rows);
        }
    });

    [funcInput, x0Input, y0Input, hInput, stepsInput].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
