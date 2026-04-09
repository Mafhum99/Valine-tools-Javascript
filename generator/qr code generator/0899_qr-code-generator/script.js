/**
 * QR Code Generator
 * Generate QR codes from text or URLs
 *
 * Uses a simplified data-to-pattern encoding for visual representation.
 * For production QR codes that scan, integrate a library like qrcode.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'QR Code Generator', icon: '\u{1f4f1}' });

    const qrInputEl = $('#qrInput');
    const qrSizeEl = $('#qrSize');
    const qrSizeValueEl = $('#qrSizeValue');
    const qrErrorCorrectionEl = $('#qrErrorCorrection');
    const qrMarginEl = $('#qrMargin');
    const qrMarginValueEl = $('#qrMarginValue');
    const previewEl = $('#qrPreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentSVG = '';

    // QR Code finder pattern (7x7)
    function finderPattern(x, y, size) {
        const rects = [];
        // Outer black border
        for (let i = 0; i < 7; i++) {
            rects.push({ x: x + i, y: y });
            rects.push({ x: x + i, y: y + 6 });
        }
        for (let i = 1; i < 6; i++) {
            rects.push({ x: x, y: y + i });
            rects.push({ x: x + 6, y: y + i });
        }
        // Inner white (skip - we just don't draw it)
        // Center black 3x3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                rects.push({ x: x + 2 + i, y: y + 2 + j });
            }
        }
        return rects;
    }

    // Alignment pattern (5x5)
    function alignmentPattern(cx, cy) {
        const rects = [];
        // Outer
        for (let i = 0; i < 5; i++) {
            rects.push({ x: cx - 2 + i, y: cy - 2 });
            rects.push({ x: cx - 2 + i, y: cy + 2 });
        }
        for (let i = 1; i < 4; i++) {
            rects.push({ x: cx - 2, y: cy - 2 + i });
            rects.push({ x: cx + 2, y: cy - 2 + i });
        }
        // Center
        rects.push({ x: cx, y: cy });
        return rects;
    }

    // Timing pattern
    function timingPatterns(size) {
        const rects = [];
        for (let i = 8; i < size - 8; i++) {
            if (i % 2 === 0) {
                rects.push({ x: i, y: 6 });
                rects.push({ x: 6, y: i });
            }
        }
        return rects;
    }

    // Generate deterministic pattern from string
    function generatePattern(str, gridSize) {
        const rects = [];

        // Finder patterns (3 corners)
        rects.push(...finderPattern(0, 0));
        rects.push(...finderPattern(gridSize - 7, 0));
        rects.push(...finderPattern(0, gridSize - 7));

        // Timing patterns
        rects.push(...timingPatterns(gridSize));

        // Alignment pattern for larger grids
        if (gridSize >= 21) {
            const alignPos = Math.floor(gridSize / 2);
            rects.push(...alignmentPattern(alignPos, alignPos));
        }

        // Data area - use hash of string for deterministic pattern
        const hash = hashCode(str);
        const dataStart = 9;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Skip finder pattern areas
                if (x < 9 && y < 9) continue;
                if (x >= gridSize - 8 && y < 9) continue;
                if (x < 9 && y >= gridSize - 8) continue;
                if (y === 6 || x === 6) continue;

                // Deterministic pseudo-random based on hash
                const val = simpleHash(hash, x, y);
                if (val % 3 !== 0) { // ~66% fill for visual density
                    rects.push({ x, y });
                }
            }
        }

        return rects;
    }

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function simpleHash(seed, x, y) {
        let h = seed;
        h = Math.imul(h ^ x, 0x5bd1e995);
        h = Math.imul(h ^ y, 0x5bd1e995);
        return Math.abs(h);
    }

    function generateQRCode(text, moduleSize, margin, errorCorrection) {
        if (!text.trim()) {
            throw new Error('Please enter text or URL');
        }

        // Determine grid size based on text length and error correction
        const textLen = text.length;
        let gridSize;
        if (textLen <= 10) gridSize = 21;
        else if (textLen <= 25) gridSize = 25;
        else if (textLen <= 50) gridSize = 29;
        else if (textLen <= 100) gridSize = 33;
        else gridSize = 37;

        // Higher error correction = larger grid
        const ecMultiplier = { L: 1, M: 1.1, Q: 1.2, H: 1.3 };
        gridSize = Math.ceil(gridSize * (ecMultiplier[errorCorrection] || 1));
        gridSize = Math.min(gridSize, 45); // Cap at reasonable size
        if (gridSize % 4 !== 1) gridSize = gridSize + (4 - (gridSize % 4)) + 1;

        const rects = generatePattern(text, gridSize);
        const totalSize = (gridSize + margin * 2) * moduleSize;

        let svgRects = '';
        rects.forEach(r => {
            const px = (r.x + margin) * moduleSize;
            const py = (r.y + margin) * moduleSize;
            svgRects += `    <rect x="${px}" y="${py}" width="${moduleSize}" height="${moduleSize}"/>\n`;
        });

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <rect width="${totalSize}" height="${totalSize}" fill="white"/>
  <g fill="black">
${svgRects}  </g>
</svg>`;
    }

    function generate() {
        try {
            const text = qrInputEl.value.trim();
            if (!text) {
                outputEl.textContent = 'Please enter text or URL';
                previewEl.innerHTML = '<p class="text-muted">No input provided.</p>';
                return;
            }

            const moduleSize = parseInt(qrSizeEl.value) || 8;
            const margin = parseInt(qrMarginEl.value) || 4;
            const errorCorrection = qrErrorCorrectionEl.value;

            currentSVG = generateQRCode(text, moduleSize, margin, errorCorrection);

            // For preview, use a smaller module size to fit nicely
            const previewModuleSize = Math.max(moduleSize, 6);
            const previewSVG = generateQRCode(text, previewModuleSize, margin, errorCorrection);
            previewEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:150px;padding:20px;background:#f8fafc;border-radius:8px;">${previewSVG}</div>`;
            outputEl.textContent = currentSVG;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate QR code.</p>';
        }
    }

    function clear() {
        qrInputEl.value = 'https://example.com';
        qrSizeEl.value = 8;
        qrSizeValueEl.textContent = '8';
        qrErrorCorrectionEl.value = 'M';
        qrMarginEl.value = 4;
        qrMarginValueEl.textContent = '4';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentSVG = '';
    }

    qrSizeEl.addEventListener('input', () => { qrSizeValueEl.textContent = qrSizeEl.value; });
    qrMarginEl.addEventListener('input', () => { qrMarginValueEl.textContent = qrMarginEl.value; });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentSVG) copyToClipboard(currentSVG);
        });
    }

    qrInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generate();
    });

    [qrErrorCorrectionEl].forEach(el => el.addEventListener('change', generate));
});
