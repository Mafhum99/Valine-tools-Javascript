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

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

function calculateSleep() {
    const mode = $('#mode').value;
    const timeVal = $('#time').value;
    const latency = parseInt($('#latency').value) || 0;

    if (!timeVal) {
        showToast('Please select a time');
        return;
    }

    const [hours, minutes] = timeVal.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    const cycles = [4, 5, 6];
    let results = [];

    if (mode === 'wakeup') {
        // Target is wake up time, find bedtimes
        cycles.forEach(c => {
            const bedtime = new Date(targetDate.getTime() - (c * 90 * 60 * 1000) - (latency * 60 * 1000));
            results.push({
                cycles: c,
                hours: c * 1.5,
                time: formatTime(bedtime),
                label: c === 5 ? 'Recommended' : ''
            });
        });
        results.reverse(); // Show longer sleep first? Or shorter? 
        // Typically sleep calculators show the times to go to bed to wake up at X.
    } else {
        // Target is bedtime, find wake up times
        cycles.forEach(c => {
            const wakeup = new Date(targetDate.getTime() + (c * 90 * 60 * 1000) + (latency * 60 * 1000));
            results.push({
                cycles: c,
                hours: c * 1.5,
                time: formatTime(wakeup),
                label: c === 5 ? 'Recommended' : ''
            });
        });
    }

    renderResults(results, mode);
}

function renderResults(results, mode) {
    const output = $('#output');
    output.innerHTML = '';

    const list = createElement('div', { className: 'results-list' });
    
    const titleText = mode === 'wakeup' ? 'If you want to wake up at ' + $('#time').value + ', you should go to bed at:' : 'If you go to bed at ' + $('#time').value + ', you should wake up at:';
    
    list.appendChild(createElement('p', { textContent: titleText, className: 'mb-2' }));

    results.forEach(res => {
        const item = createElement('div', { 
            className: 'result-item mt-1',
            style: 'display:flex; justify-content:space-between; align-items:center; padding:0.5rem; background:var(--gray-100); border-radius:var(--radius);'
        }, [
            createElement('div', {}, [
                createElement('strong', { textContent: res.time, style: 'font-size:1.2rem; color:var(--primary);' }),
                createElement('span', { textContent: ` (${res.hours} hours - ${res.cycles} cycles)`, className: 'text-muted ml-1', style: 'font-size:0.8rem; margin-left:0.5rem;' })
            ]),
            res.label ? createElement('span', { textContent: res.label, className: 'badge', style: 'background:var(--success); color:white; padding:0.2rem 0.5rem; border-radius:1rem; font-size:0.7rem;' }) : ''
        ]);
        list.appendChild(item);
    });

    output.appendChild(list);
}

// ========================================
// Event Listeners
// ========================================
$('#action-btn').addEventListener('click', calculateSleep);

$('#clear-btn').addEventListener('click', () => {
    $('#time').value = '';
    $('#output').textContent = 'Enter a time and click Calculate to see recommendations.';
});

$('#copy-btn').addEventListener('click', () => {
    const outputText = $('#output').innerText;
    if (outputText && outputText !== 'Enter a time and click Calculate to see recommendations.') {
        copyToClipboard(outputText);
    } else {
        showToast('Nothing to copy!');
    }
});
