/**
 * SVG Path Generator
 * Generate SVG path data
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'SVG Path Generator', icon: '' });

    const pathType = $('#path-type');
    const strokeColor = $('#stroke-color');
    const strokeColorText = $('#stroke-color-text');
    const strokeWidth = $('#stroke-width');
    const svgPreview = $('#svg-preview');
    const pathCode = $('#path-code');
    const copyBtn = $('#copy');
    const copyFullBtn = $('#copy-full');

    let currentPathD = '';

    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    function syncColor(pickerEl, textEl) {
        textEl.value = pickerEl.value;
        generatePath();
    }

    function syncTextToPicker(textEl, pickerEl) {
        let val = textEl.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (isValidHex(val)) {
            pickerEl.value = val;
            generatePath();
        }
    }

    function val(id) {
        return parseFloat($(id).value) || 0;
    }

    function generatePath() {
        try {
            const type = pathType.value;
            const stroke = strokeColor.value;
            const sw = Math.max(1, parseInt(strokeWidth.value) || 2);
            let d = '';
            const viewBoxW = 200;
            const viewBoxH = 160;

            switch (type) {
                case 'line':
                    d = `M ${val('#line-x1')} ${val('#line-y1')} L ${val('#line-x2')} ${val('#line-y2')}`;
                    break;
                case 'curve':
                    d = `M ${val('#curve-x1')} ${val('#curve-y1')} C ${val('#curve-cp1x')} ${val('#curve-cp1y')}, ${val('#curve-cp2x')} ${val('#curve-cp2y')}, ${val('#curve-ex')} ${val('#curve-ey')}`;
                    break;
                case 'quadratic':
                    d = `M ${val('#quad-x1')} ${val('#quad-y1')} Q ${val('#quad-cpx')} ${val('#quad-cpy')}, ${val('#quad-ex')} ${val('#quad-ey')}`;
                    break;
                case 'arc':
                    d = `M ${val('#arc-x1')} ${val('#arc-y1')} A ${val('#arc-rx')} ${val('#arc-ry')} ${val('#arc-rotation')} ${$('#arc-large').value} ${$('#arc-sweep').value} ${val('#arc-ex')} ${val('#arc-ey')}`;
                    break;
                case 'rectangle': {
                    const x = val('#rect-x');
                    const y = val('#rect-y');
                    const w = val('#rect-w');
                    const h = val('#rect-h');
                    const rx = val('#rect-rx');
                    if (rx > 0) {
                        d = `M ${x + rx} ${y} L ${x + w - rx} ${y} Q ${x + w} ${y} ${x + w} ${y + rx} L ${x + w} ${y + h - rx} Q ${x + w} ${y + h} ${x + w - rx} ${y + h} L ${x + rx} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rx} L ${x} ${y + rx} Q ${x} ${y} ${x + rx} ${y} Z`;
                    } else {
                        d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
                    }
                    break;
                }
                case 'circle': {
                    const cx = val('#circle-cx');
                    const cy = val('#circle-cy');
                    const r = val('#circle-r');
                    d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
                    break;
                }
                default:
                    d = 'M 0 0';
            }

            currentPathD = d;

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxW} ${viewBoxH}" width="${viewBoxW}" height="${viewBoxH}">\n  <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />\n</svg>`;

            svgPreview.innerHTML = svg;
            pathCode.textContent = `d="${d}"`;
        } catch (error) {
            pathCode.textContent = 'Error: ' + error.message;
        }
    }

    function togglePathControls() {
        const type = pathType.value;
        $$('.path-controls').forEach(el => {
            el.style.display = 'none';
        });
        const target = $(`#${type}-controls`);
        if (target) {
            target.style.display = '';
        }
    }

    function getAllInputs() {
        return [
            '#line-x1', '#line-y1', '#line-x2', '#line-y2',
            '#curve-x1', '#curve-y1', '#curve-cp1x', '#curve-cp1y',
            '#curve-cp2x', '#curve-cp2y', '#curve-ex', '#curve-ey',
            '#quad-x1', '#quad-y1', '#quad-cpx', '#quad-cpy', '#quad-ex', '#quad-ey',
            '#arc-x1', '#arc-y1', '#arc-rx', '#arc-ry', '#arc-rotation',
            '#arc-ex', '#arc-ey', '#arc-large', '#arc-sweep',
            '#rect-x', '#rect-y', '#rect-w', '#rect-h', '#rect-rx',
            '#circle-cx', '#circle-cy', '#circle-r'
        ];
    }

    // Event listeners
    pathType.addEventListener('change', () => {
        togglePathControls();
        generatePath();
    });

    getAllInputs().forEach(id => {
        const el = $(id);
        if (el) {
            el.addEventListener('input', generatePath);
            el.addEventListener('change', generatePath);
        }
    });

    strokeWidth.addEventListener('input', generatePath);
    strokeColor.addEventListener('input', () => syncColor(strokeColor, strokeColorText));
    strokeColorText.addEventListener('input', () => syncTextToPicker(strokeColorText, strokeColor));

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(currentPathD));
    }

    if (copyFullBtn) {
        copyFullBtn.addEventListener('click', () => {
            const fullSvg = svgPreview.innerHTML.trim();
            copyToClipboard(fullSvg);
        });
    }

    togglePathControls();
    generatePath();
});
