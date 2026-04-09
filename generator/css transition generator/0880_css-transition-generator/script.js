/**
 * CSS Transition Generator
 * Generate CSS transition properties
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Transition Generator', icon: '\uD83D\uDD04' });

    const transitionProperty = $('#transition-property');
    const transitionDuration = $('#transition-duration');
    const transitionEasing = $('#transition-easing');
    const transitionDelay = $('#transition-delay');
    const transitionPreview = $('#transition-preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const presetSmooth = $('#preset-smooth');
    const presetSnap = $('#preset-snap');

    function generateTransition() {
        try {
            const property = transitionProperty.value;
            const duration = parseFloat(transitionDuration.value) || 0.3;
            const easing = transitionEasing.value;
            const delay = parseFloat(transitionDelay.value) || 0;

            $('#transition-duration-value').textContent = duration.toFixed(2) + 's';
            $('#transition-delay-value').textContent = delay.toFixed(2) + 's';

            let transitionValue = `${property} ${duration}s ${easing}`;
            if (delay > 0) {
                transitionValue += ` ${delay}s`;
            }

            const css = `transition: ${transitionValue};`;

            // Apply to preview
            transitionPreview.style.transition = transitionValue;

            // Create hover effect for preview
            let styleEl = $('#dynamic-transition-style');
            if (styleEl) styleEl.remove();
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-transition-style';

            const hoverProps = getHoverStyles(property);
            styleEl.textContent = `
                .transition-preview-box {
                    transition: ${transitionValue} !important;
                    cursor: pointer;
                }
                .transition-preview-box:hover {
                    ${hoverProps}
                }
            `;
            document.head.appendChild(styleEl);

            cssCode.textContent = css;
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    function getHoverStyles(property) {
        switch (property) {
            case 'all':
                return 'transform: scale(1.05);\n    background-color: #2563eb;\n    color: #fff;\n    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);';
            case 'background-color':
                return 'background-color: #2563eb;\n    color: #fff;';
            case 'color':
                return 'color: #2563eb;';
            case 'transform':
                return 'transform: scale(1.08) rotate(2deg);';
            case 'opacity':
                return 'opacity: 0.7;';
            case 'box-shadow':
                return 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);';
            case 'border-color':
                return 'border-color: #2563eb;\n    color: #2563eb;';
            case 'width':
                return 'width: 140px;';
            case 'height':
                return 'height: 100px;';
            default:
                return 'transform: scale(1.05);';
        }
    }

    transitionProperty.addEventListener('change', generateTransition);
    transitionDuration.addEventListener('input', generateTransition);
    transitionEasing.addEventListener('change', generateTransition);
    transitionDelay.addEventListener('input', generateTransition);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    if (presetSmooth) {
        presetSmooth.addEventListener('click', () => {
            transitionProperty.value = 'all';
            transitionDuration.value = 0.4;
            transitionEasing.value = 'ease-in-out';
            transitionDelay.value = 0;
            generateTransition();
        });
    }

    if (presetSnap) {
        presetSnap.addEventListener('click', () => {
            transitionProperty.value = 'transform';
            transitionDuration.value = 0.1;
            transitionEasing.value = 'ease-out';
            transitionDelay.value = 0;
            generateTransition();
        });
    }

    generateTransition();
});
