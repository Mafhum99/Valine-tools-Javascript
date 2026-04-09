/**
 * Color Contrast Checker
 * Check color contrast for accessibility (WCAG)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Color Contrast Checker', icon: '' });

    const fg = $('#cc-foreground'), fgText = $('#cc-foreground-text');
    const bg = $('#cc-background'), bgText = $('#cc-background-text');
    const preview = $('#cc-preview');
    const output = $('#cc-css');
    const copyBtn = $('#copy');

    function isValidHex(h) { return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(h); }
    function sync(p, t) {
        p.addEventListener('input', () => { t.value = p.value; gen(); });
        t.addEventListener('input', () => { if (isValidHex(t.value)) { p.value = t.value; gen(); } });
    }

    function relativeLuminance(hex) {
        const rgb = Color.hexToRgb(hex);
        if (!rgb) return 0;
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function contrastRatio(hex1, hex2) {
        const l1 = relativeLuminance(hex1);
        const l2 = relativeLuminance(hex2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function gen() {
        const fgColor = fg.value;
        const bgColor = bg.value;
        const ratio = contrastRatio(fgColor, bgColor);

        const aaNormal = ratio >= 4.5;
        const aaLarge = ratio >= 3;
        const aaaNormal = ratio >= 7;
        const aaaLarge = ratio >= 4.5;

        const pass = (ok) => ok ? '<span style="color:#10b981;font-weight:600;">PASS</span>' : '<span style="color:#ef4444;font-weight:600;">FAIL</span>';

        preview.style.backgroundColor = bgColor;
        preview.innerHTML = `
            <p style="color:${fgColor};font-size:18px;font-weight:600;font-family:sans-serif;">Sample Text in ${fgColor}</p>
            <p style="color:${fgColor};font-size:14px;font-family:sans-serif;opacity:0.9;">Smaller body text sample for testing readability.</p>`;

        const css = `Contrast Ratio: ${ratio.toFixed(2)}:1\n\nWCAG 2.1 Results:\n  AA Normal text (4.5:1):   ${pass(aaNormal)}\n  AA Large text (3:1):      ${pass(aaLarge)}\n  AAA Normal text (7:1):    ${pass(aaaNormal)}\n  AAA Large text (4.5:1):   ${pass(aaaLarge)}\n\n/* CSS */\ncolor: ${fgColor};\nbackground-color: ${bgColor};`;

        output.textContent = css;
    }

    sync(fg, fgText); sync(bg, bgText);
    copyBtn.addEventListener('click', () => copyToClipboard(output.textContent));
    gen();
});
