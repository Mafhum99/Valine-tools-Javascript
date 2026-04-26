// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
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
        alert('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Math Utilities
// ========================================
const MathUtil = {
    degToRad(deg) { return deg * Math.PI / 180; },
    radToDeg(rad) { return rad * 180 / Math.PI; }
};

// ========================================
// Law of Sines Logic
// ========================================
const LawOfSines = {
    // a / sin(A) = b / sin(B) => a = b * sin(A) / sin(B)
    findSide(b, angleA, angleB) {
        const sinA = Math.sin(MathUtil.degToRad(angleA));
        const sinB = Math.sin(MathUtil.degToRad(angleB));
        return (b * sinA) / sinB;
    },
    // a / sin(A) = b / sin(B) => sin(A) = a * sin(B) / b
    findAngle(a, b, angleB) {
        const sinB = Math.sin(MathUtil.degToRad(angleB));
        const sinA = (a * sinB) / b;
        if (sinA > 1) return null; // No solution
        return MathUtil.radToDeg(Math.asin(sinA));
    }
};

// ========================================
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = $('#mode');
    const sideAInput = $('#side-a');
    const sideBInput = $('#side-b');
    const sideCInput = $('#side-c');
    const angleAInput = $('#angle-a');
    const angleBInput = $('#angle-b');
    const angleCInput = $('#angle-c');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const outputEl = $('#output');
    const copyBtn = $('#copy');

    function updateVisibility() {
        const mode = modeSelect.value;
        // Reset all
        [sideAInput, sideBInput, sideCInput, angleAInput, angleBInput, angleCInput].forEach(el => {
            el.parentElement.style.display = 'block';
        });

        if (mode === 'find-side') {
            sideAInput.parentElement.style.display = 'none';
            sideCInput.parentElement.style.display = 'none';
            angleCInput.parentElement.style.display = 'none';
        } else if (mode === 'find-angle') {
            sideCInput.parentElement.style.display = 'none';
            angleAInput.parentElement.style.display = 'none';
            angleCInput.parentElement.style.display = 'none';
        }
    }

    modeSelect.addEventListener('change', updateVisibility);

    calculateBtn.addEventListener('click', () => {
        const mode = modeSelect.value;
        try {
            let result = '';
            if (mode === 'find-side') {
                const b = parseFloat(sideBInput.value);
                const A = parseFloat(angleAInput.value);
                const B = parseFloat(angleBInput.value);
                if (isNaN(b) || isNaN(A) || isNaN(B)) throw new Error('Please fill all fields');
                if (A + B >= 180) throw new Error('Sum of angles must be < 180°');
                
                const a = LawOfSines.findSide(b, A, B);
                const C = 180 - A - B;
                const c = LawOfSines.findSide(b, C, B);
                
                result = `Side a = ${a.toFixed(4)}\nSide c = ${c.toFixed(4)}\nAngle C = ${C.toFixed(2)}°`;
            } else if (mode === 'find-angle') {
                const a = parseFloat(sideAInput.value);
                const b = parseFloat(sideBInput.value);
                const B = parseFloat(angleBInput.value);
                if (isNaN(a) || isNaN(b) || isNaN(B)) throw new Error('Please fill all fields');
                
                const A = LawOfSines.findAngle(a, b, B);
                if (A === null) throw new Error('No triangle exists with these values (sin(A) > 1)');
                
                const C = 180 - A - B;
                const c = LawOfSines.findSide(b, C, B);
                
                result = `Angle A = ${A.toFixed(2)}°\nAngle C = ${C.toFixed(2)}°\nSide c = ${c.toFixed(4)}`;
                
                // SSA Ambiguous Case check
                if (a < b && a > b * Math.sin(MathUtil.degToRad(B))) {
                    const A2 = 180 - A;
                    const C2 = 180 - A2 - B;
                    if (C2 > 0) {
                        const c2 = LawOfSines.findSide(b, C2, B);
                        result += `\n\nAmbiguous Case (2nd Solution):\nAngle A' = ${A2.toFixed(2)}°\nAngle C' = ${C2.toFixed(2)}°\nSide c' = ${c2.toFixed(4)}`;
                    }
                }
            } else if (mode === 'ssa') {
                // Same logic as find-angle but more explicit
                const a = parseFloat(sideAInput.value);
                const b = parseFloat(sideBInput.value);
                const B = parseFloat(angleBInput.value);
                if (isNaN(a) || isNaN(b) || isNaN(B)) throw new Error('Please fill all fields');
                
                const sinB = Math.sin(MathUtil.degToRad(B));
                const h = b * sinB;
                
                if (a < h) {
                    result = "No solution (a < h)";
                } else if (Math.abs(a - h) < 0.0001) {
                    const A = 90;
                    const C = 180 - A - B;
                    const c = LawOfSines.findSide(b, C, B);
                    result = `One solution (Right triangle):\nAngle A = 90°\nAngle C = ${C.toFixed(2)}°\nSide c = ${c.toFixed(4)}`;
                } else if (a >= b) {
                    const A = LawOfSines.findAngle(a, b, B);
                    const C = 180 - A - B;
                    const c = LawOfSines.findSide(b, C, B);
                    result = `One solution:\nAngle A = ${A.toFixed(2)}°\nAngle C = ${C.toFixed(2)}°\nSide c = ${c.toFixed(4)}`;
                } else {
                    const A1 = LawOfSines.findAngle(a, b, B);
                    const C1 = 180 - A1 - B;
                    const c1 = LawOfSines.findSide(b, C1, B);
                    
                    const A2 = 180 - A1;
                    const C2 = 180 - A2 - B;
                    const c2 = LawOfSines.findSide(b, C2, B);
                    
                    result = `Two solutions (Ambiguous Case):\n\nSolution 1:\nAngle A1 = ${A1.toFixed(2)}°\nAngle C1 = ${C1.toFixed(2)}°\nSide c1 = ${c1.toFixed(4)}\n\nSolution 2:\nAngle A2 = ${A2.toFixed(2)}°\nAngle C2 = ${C2.toFixed(2)}°\nSide c2 = ${c2.toFixed(4)}`;
                }
            }
            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    });

    clearBtn.addEventListener('click', () => {
        [sideAInput, sideBInput, sideCInput, angleAInput, angleBInput, angleCInput].forEach(el => el.value = '');
        outputEl.textContent = '-';
    });

    copyBtn.addEventListener('click', () => {
        copyToClipboard(outputEl.textContent);
    });

    updateVisibility();
});
