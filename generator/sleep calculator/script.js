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

function calculate() {
    const mode = $('#calc-mode').value;
    const timeVal = $('#target-time').value;

    if (!timeVal) {
        showToast('Please select a time');
        return;
    }

    const [hours, minutes] = timeVal.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    const cycles = [6, 5, 4];
    const output = $('#output');
    output.innerHTML = '';

    const container = createElement('div');
    const intro = mode === 'to-wake' ? `To wake up at ${timeVal}, you should go to sleep at:` : `If you go to sleep at ${timeVal}, you should wake up at:`;
    container.appendChild(createElement('p', { textContent: intro, className: 'mb-2', style: 'font-weight:600;' }));

    cycles.forEach(c => {
        const offset = c * 90 + 15;
        const resultDate = new Date(date.getTime() + (mode === 'to-wake' ? -offset : offset) * 60000);
        const timeStr = resultDate.toTimeString().slice(0, 5);
        
        const item = createElement('div', { 
            className: 'mt-1',
            style: 'padding:0.75rem; background:var(--gray-100); border-radius:var(--radius); display:flex; justify-content:space-between; align-items:center;'
        }, [
            createElement('span', { textContent: timeStr, style: 'font-weight:bold; font-size:1.2rem; color:var(--primary);' }),
            createElement('span', { textContent: `${c * 1.5}h sleep (${c} cycles)`, className: 'text-muted', style: 'font-size:0.85rem;' })
        ]);
        container.appendChild(item);
    });

    output.appendChild(container);
}

$('#action-btn').addEventListener('click', calculate);
$('#clear-btn').addEventListener('click', () => {
    $('#target-time').value = '';
    $('#output').textContent = 'Enter a time to see the best sleep/wake schedule.';
});
$('#copy-btn').addEventListener('click', () => {
    const text = $('#output').innerText;
    if (text && !text.includes('Enter a time')) copyToClipboard(text);
});
