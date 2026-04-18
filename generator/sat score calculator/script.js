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
    initTool({ name: 'SAT Score Calculator', icon: '🎓' });
    
    const mathInput = $('#math-score');
    const erwInput = $('#erw-score');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    function calculate() {
        const math = parseInt(mathInput.value);
        const erw = parseInt(erwInput.value);
        
        if (isNaN(math) || math < 200 || math > 800) {
            outputEl.textContent = 'Math score must be between 200 and 800.';
            return;
        }
        
        if (isNaN(erw) || erw < 200 || erw > 800) {
            outputEl.textContent = 'ERW score must be between 200 and 800.';
            return;
        }

        const total = math + erw;
        let interpretation = '';

        if (total >= 1500) interpretation = 'Excellent! You are in the top 1% of test takers.';
        else if (total >= 1400) interpretation = 'Great! This score is highly competitive for top colleges.';
        else if (total >= 1200) interpretation = 'Good! This score is above average.';
        else if (total >= 1050) interpretation = 'Average score.';
        else interpretation = 'Below average. Consider more preparation if aiming for competitive colleges.';
        
        outputEl.innerHTML = `
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary); margin-bottom: 0.5rem;">Total Score: ${total} / 1600</div>
            <div style="font-size: 0.9rem; color: var(--gray-600);">${interpretation}</div>
            <hr style="margin: 0.5rem 0; border: 0; border-top: 1px solid var(--gray-200);">
            <div style="display: flex; justify-content: space-around;">
                <div>Math: <strong>${math}</strong></div>
                <div>ERW: <strong>${erw}</strong></div>
            </div>
        `;
    }
    
    function clear() {
        mathInput.value = '';
        erwInput.value = '';
        outputEl.textContent = '-';
        mathInput.focus();
    }
    
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', () => {
        if (outputEl.textContent !== '-') {
            copyToClipboard(outputEl.innerText);
        }
    });

    [mathInput, erwInput].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
