/**
 * CSS Animation Generator
 * Generate CSS keyframe animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Animation Generator', icon: '\uD83C\uDFAC' });

    const animationName = $('#animation-name');
    const animationPreset = $('#animation-preset');
    const duration = $('#duration');
    const easing = $('#easing');
    const iterations = $('#iterations');
    const animPreview = $('#anim-preview');
    const cssCode = $('#css-code');
    const copyBtn = $('#copy');
    const playBtn = $('#play');

    const keyframePresets = {
        'fade': `@keyframes {name} {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}`,
        'slide-up': `@keyframes {name} {\n  from { opacity: 0; transform: translateY(30px); }\n  to { opacity: 1; transform: translateY(0); }\n}`,
        'slide-down': `@keyframes {name} {\n  from { opacity: 0; transform: translateY(-30px); }\n  to { opacity: 1; transform: translateY(0); }\n}`,
        'slide-left': `@keyframes {name} {\n  from { opacity: 0; transform: translateX(30px); }\n  to { opacity: 1; transform: translateX(0); }\n}`,
        'slide-right': `@keyframes {name} {\n  from { opacity: 0; transform: translateX(-30px); }\n  to { opacity: 1; transform: translateX(0); }\n}`,
        'bounce': `@keyframes {name} {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}`,
        'pulse': `@keyframes {name} {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.05); }\n}`,
        'shake': `@keyframes {name} {\n  0%, 100% { transform: translateX(0); }\n  25% { transform: translateX(-8px); }\n  75% { transform: translateX(8px); }\n}`,
        'spin': `@keyframes {name} {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}`,
        'flip': `@keyframes {name} {\n  from { transform: perspective(400px) rotateY(0); }\n  to { transform: perspective(400px) rotateY(360deg); }\n}`,
        'custom': `@keyframes {name} {\n  from { /* start state */ }\n  to { /* end state */ }\n}`
    };

    function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9_-]/g, '') || 'myAnimation';
    }

    function generateAnimation() {
        try {
            const name = sanitizeName(animationName.value);
            const preset = animationPreset.value;
            const dur = parseFloat(duration.value) || 1;
            const ease = easing.value;
            const iter = iterations.value;

            $('#duration-value').textContent = dur.toFixed(1) + 's';

            const keyframesTemplate = keyframePresets[preset] || keyframePresets['fade'];
            const keyframes = keyframesTemplate.replace(/\{name\}/g, name);

            const animValue = `${name} ${dur}s ${ease} ${iter === 'infinite' ? 'infinite' : iter}`;
            const usage = `.element {\n  animation: ${animValue};\n}`;

            cssCode.textContent = `${keyframes}\n\n${usage}`;

            // Apply animation to preview
            animPreview.style.animation = 'none';
            animPreview.offsetHeight; // Trigger reflow
            animPreview.style.animation = animValue;

            // Inject keyframes into document
            let styleEl = $('#dynamic-keyframes');
            if (styleEl) styleEl.remove();
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-keyframes';
            styleEl.textContent = keyframes;
            document.head.appendChild(styleEl);
        } catch (error) {
            cssCode.textContent = 'Error: ' + error.message;
        }
    }

    animationName.addEventListener('input', generateAnimation);
    animationPreset.addEventListener('change', generateAnimation);
    duration.addEventListener('input', generateAnimation);
    easing.addEventListener('change', generateAnimation);
    iterations.addEventListener('change', generateAnimation);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(cssCode.textContent));
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            animPreview.style.animation = 'none';
            animPreview.offsetHeight; // Trigger reflow
            generateAnimation();
        });
    }

    generateAnimation();
});
