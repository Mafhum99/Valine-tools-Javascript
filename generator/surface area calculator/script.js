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
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const shapeSelect = $('#shape-select');
    const inputsContainer = $('#inputs-container');
    const calculateBtn = $('#calculate-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');
    const resArea = $('#res-area');

    const shapes = {
        cube: {
            label: 'Cube',
            fields: [{ id: 'side', label: 'Side Length (s)' }]
        },
        'rectangular-prism': {
            label: 'Rectangular Prism (Balok)',
            fields: [
                { id: 'length', label: 'Length (l)' },
                { id: 'width', label: 'Width (w)' },
                { id: 'height', label: 'Height (h)' }
            ]
        },
        sphere: {
            label: 'Sphere',
            fields: [{ id: 'radius', label: 'Radius (r)' }]
        },
        cylinder: {
            label: 'Cylinder',
            fields: [
                { id: 'radius', label: 'Radius (r)' },
                { id: 'height', label: 'Height (h)' }
            ]
        },
        cone: {
            label: 'Cone',
            fields: [
                { id: 'radius', label: 'Radius (r)' },
                { id: 'height', label: 'Height (h)' }
            ]
        },
        'triangular-prism': {
            label: 'Triangular Prism',
            fields: [
                { id: 'base-a', label: 'Base Side A' },
                { id: 'base-b', label: 'Base Side B' },
                { id: 'base-c', label: 'Base Side C' },
                { id: 'length', label: 'Length (h)' }
            ]
        }
    };

    function updateInputs() {
        const shape = shapes[shapeSelect.value];
        inputsContainer.innerHTML = '';
        shape.fields.forEach(field => {
            const group = createElement('div', { className: 'form-group' }, [
                createElement('label', { className: 'form-label', htmlFor: field.id, textContent: field.label }),
                createElement('input', { type: 'number', id: field.id, className: 'form-input', placeholder: '0', step: 'any', min: '0' })
            ]);
            inputsContainer.appendChild(group);
        });
    }

    shapeSelect.addEventListener('change', updateInputs);
    updateInputs();

    function calculate() {
        const shape = shapeSelect.value;
        const getVal = (id) => parseFloat($(`#${id}`).value) || 0;
        let area = 0;

        try {
            switch (shape) {
                case 'cube':
                    const s = getVal('side');
                    area = 6 * s * s;
                    break;
                case 'rectangular-prism':
                    const l = getVal('length');
                    const w = getVal('width');
                    const h = getVal('height');
                    area = 2 * (l * w + l * h + w * h);
                    break;
                case 'sphere':
                    const r = getVal('radius');
                    area = 4 * Math.PI * r * r;
                    break;
                case 'cylinder':
                    const cr = getVal('radius');
                    const ch = getVal('height');
                    area = 2 * Math.PI * cr * (cr + ch);
                    break;
                case 'cone':
                    const conr = getVal('radius');
                    const conh = getVal('height');
                    const slantHeight = Math.sqrt(conr * conr + conh * conh);
                    area = Math.PI * conr * (conr + slantHeight);
                    break;
                case 'triangular-prism':
                    const a = getVal('base-a');
                    const b = getVal('base-b');
                    const c = getVal('base-c');
                    const length = getVal('length');
                    // Use Heron's formula for base area
                    const s_tri = (a + b + c) / 2;
                    const baseArea = Math.sqrt(s_tri * (s_tri - a) * (s_tri - b) * (s_tri - c)) || 0;
                    const lateralArea = (a + b + c) * length;
                    area = 2 * baseArea + lateralArea;
                    break;
            }

            if (isNaN(area) || area < 0) throw new Error('Invalid dimensions');
            resArea.textContent = area.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' units²';
        } catch (e) {
            showToast('Error: Please check your inputs');
            resArea.textContent = '-';
        }
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', () => {
        inputsContainer.querySelectorAll('input').forEach(i => i.value = '');
        resArea.textContent = '-';
    });
    copyBtn.addEventListener('click', () => {
        if (resArea.textContent === '-') return;
        copyToClipboard(`Surface Area of ${shapes[shapeSelect.value].label}: ${resArea.textContent}`);
    });
});
