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
// Number Formatting
// ========================================
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * Letter Grade Converter
 * Convert percentage to letter grade
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Letter Grade Converter', icon: '📝' });

    const percentageEl = $('#percentage');
    const usePlusMinusEl = $('#use-plus-minus');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    const GPA_SCALE = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    };

    const DETAILED_SCALE = [
        { grade: 'A+', min: 97 }, { grade: 'A', min: 93 }, { grade: 'A-', min: 90 },
        { grade: 'B+', min: 87 }, { grade: 'B', min: 83 }, { grade: 'B-', min: 80 },
        { grade: 'C+', min: 77 }, { grade: 'C', min: 73 }, { grade: 'C-', min: 70 },
        { grade: 'D+', min: 67 }, { grade: 'D', min: 63 }, { grade: 'D-', min: 60 },
        { grade: 'F', min: 0 }
    ];

    const BASIC_SCALE = [
        { grade: 'A', min: 90 },
        { grade: 'B', min: 80 },
        { grade: 'C', min: 70 },
        { grade: 'D', min: 60 },
        { grade: 'F', min: 0 }
    ];

    function calculate() {
        const val = parseFloat(percentageEl.value);
        if (isNaN(val)) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please enter a valid percentage</p>';
            return;
        }

        if (val < 0 || val > 100) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Percentage must be between 0 and 100</p>';
            return;
        }

        const useDetailed = usePlusMinusEl.checked;
        const scale = useDetailed ? DETAILED_SCALE : BASIC_SCALE;

        let resultGrade = 'F';
        for (const entry of scale) {
            if (val >= entry.min) {
                resultGrade = entry.grade;
                break;
            }
        }

        const gpa = GPA_SCALE[resultGrade] || (useDetailed ? 0.0 : (resultGrade === 'A' ? 4.0 : resultGrade === 'B' ? 3.0 : resultGrade === 'C' ? 2.0 : resultGrade === 'D' ? 1.0 : 0.0));
        
        const color = gpa >= 3.5 ? '#22c55e' : gpa >= 2.5 ? '#3b82f6' : gpa >= 1.5 ? '#f59e0b' : '#ef4444';

        outputEl.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:3rem;font-weight:800;color:${color};line-height:1;">${resultGrade}</div>
                <div style="font-size:1.125rem;font-weight:600;margin-top:0.5rem;">GPA: ${gpa.toFixed(1)}</div>
                <div style="font-size:0.875rem;color:#6b7280;margin-top:0.25rem;">Percentage: ${val}%</div>
                <div style="margin-top:1rem;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                    <div style="width:${val}%;height:100%;background:${color};"></div>
                </div>
            </div>
        `;
    }

    function clear() {
        percentageEl.value = '';
        outputEl.innerHTML = '-';
        percentageEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.innerText.trim();
            if (text === '-') return;
            copyToClipboard(`Letter Grade: ${text.split('\n').join(' ')}`);
        });
    }

    percentageEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
    
    // Auto-calculate on input
    percentageEl.addEventListener('input', () => {
        if (percentageEl.value !== '') calculate();
    });
    usePlusMinusEl.addEventListener('change', () => {
        if (percentageEl.value !== '') calculate();
    });
});
