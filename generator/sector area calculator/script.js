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
    initTool({ name: 'Sector Area Calculator', icon: '🥧' });
    
    const radiusInput = $('#radius');
    const angleInput = $('#angle');
    const unitSelect = $('#unit');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    function calculate() {
        const r = parseFloat(radiusInput.value);
        const theta = parseFloat(angleInput.value);
        const unit = unitSelect.value;
        
        if (isNaN(r) || r < 0) {
            outputEl.textContent = 'Please enter a valid positive radius.';
            return;
        }
        
        if (isNaN(theta)) {
            outputEl.textContent = 'Please enter a valid angle.';
            return;
        }

        let area, arcLength;
        const pi = Math.PI;

        if (unit === 'degrees') {
            if (theta < 0 || theta > 360) {
                outputEl.textContent = 'Angle in degrees should be between 0 and 360.';
                return;
            }
            area = (theta / 360) * pi * Math.pow(r, 2);
            arcLength = (theta / 360) * 2 * pi * r;
        } else {
            if (theta < 0 || theta > 2 * pi) {
                outputEl.textContent = 'Angle in radians should be between 0 and 2π.';
                return;
            }
            area = (theta / 2) * Math.pow(r, 2);
            arcLength = theta * r;
        }
        
        outputEl.innerHTML = `
            <div><strong>Sector Area:</strong> ${area.toFixed(4)}</div>
            <div><strong>Arc Length:</strong> ${arcLength.toFixed(4)}</div>
        `;
    }
    
    function clear() {
        radiusInput.value = '';
        angleInput.value = '';
        unitSelect.selectedIndex = 0;
        outputEl.textContent = '-';
        radiusInput.focus();
    }
    
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', () => {
        if (outputEl.textContent !== '-') {
            copyToClipboard(outputEl.innerText);
        }
    });

    [radiusInput, angleInput].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
