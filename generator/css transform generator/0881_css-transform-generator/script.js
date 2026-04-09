/**
 * CSS Transform Generator
 * Generate CSS transform values
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Transform Generator', icon: '' });

    const scaleX = $('#scale-x');
    const scaleY = $('#scale-y');
    const rotate = $('#rotate');
    const translateX = $('#translate-x');
    const translateY = $('#translate-y');
    const skewX = $('#skew-x');
    const skewY = $('#skew-y');
    const preview = $('#preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const resetBtn = $('#reset');

    function generateTransform() {
        try {
            const sx = parseFloat(scaleX.value) || 1;
            const sy = parseFloat(scaleY.value) || 1;
            const rot = parseFloat(rotate.value) || 0;
            const tx = parseFloat(translateX.value) || 0;
            const ty = parseFloat(translateY.value) || 0;
            const skx = parseFloat(skewX.value) || 0;
            const sky = parseFloat(skewY.value) || 0;

            $('#scale-x-value').textContent = sx;
            $('#scale-y-value').textContent = sy;
            $('#rotate-value').textContent = rot + 'deg';

            const transforms = [];

            if (sx !== 1 || sy !== 1) {
                if (sx === sy) {
                    transforms.push(`scale(${sx})`);
                } else {
                    transforms.push(`scale(${sx}, ${sy})`);
                }
            }

            if (rot !== 0) {
                transforms.push(`rotate(${rot}deg)`);
            }

            if (tx !== 0 || ty !== 0) {
                transforms.push(`translate(${tx}px, ${ty}px)`);
            }

            if (skx !== 0 || sky !== 0) {
                transforms.push(`skew(${skx}deg, ${sky}deg)`);
            }

            const transformValue = transforms.length > 0 ? transforms.join(' ') : 'none';
            const css = `transform: ${transformValue};`;

            preview.style.transform = transformValue;
            cssCode.textContent = css;
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    function reset() {
        scaleX.value = 1;
        scaleY.value = 1;
        rotate.value = 0;
        translateX.value = 0;
        translateY.value = 0;
        skewX.value = 0;
        skewY.value = 0;
        generateTransform();
    }

    // Event listeners
    [scaleX, scaleY, rotate, translateX, translateY, skewX, skewY].forEach(el => {
        el.addEventListener('input', generateTransform);
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', reset);
    }

    generateTransform();
});
