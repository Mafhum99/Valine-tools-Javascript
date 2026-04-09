/**
 * Slug Generator
 * Convert text into URL-friendly slugs
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Slug Generator', icon: '🔗' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text to convert'; return; }
        try {
            // Remove accents/diacritics
            let slug = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            // Convert to lowercase
            slug = slug.toLowerCase();
            // Replace non-alphanumeric chars (except hyphens) with hyphens
            slug = slug.replace(/[^a-z0-9\s-]/g, '');
            // Replace spaces and underscores with hyphens
            slug = slug.replace(/[\s_]+/g, '-');
            // Collapse multiple hyphens
            slug = slug.replace(/-+/g, '-');
            // Trim hyphens from start and end
            slug = slug.replace(/^-|-$/g, '');
            outputEl.textContent = slug;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
