/**
 * Responsive Breakpoint Generator
 * Generate responsive media query CSS templates
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Responsive Breakpoint Generator', icon: '📱' });

    const mobileBreakpointEl = $('#mobileBreakpoint');
    const tabletBreakpointEl = $('#tabletBreakpoint');
    const desktopBreakpointEl = $('#desktopBreakpoint');
    const approachEl = $('#approach');
    const includeLargeDesktopEl = $('#includeLargeDesktop');
    const includeWideEl = $('#includeWide');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const previewEl = $('#preview');
    const resultEl = $('#result');
    const outputEl = $('#output');
    const copyGroupEl = $('#copyGroup');

    function generate() {
        const mobileBP = parseInt(mobileBreakpointEl.value, 10);
        const tabletBP = parseInt(tabletBreakpointEl.value, 10);
        const desktopBP = parseInt(desktopBreakpointEl.value, 10);
        const approach = approachEl.value;
        const includeLargeDesktop = includeLargeDesktopEl.checked;
        const includeWide = includeWideEl.checked;

        if (isNaN(mobileBP) || mobileBP < 320 || mobileBP > 1023) {
            showToast('Error: Mobile breakpoint must be between 320px and 1023px');
            return;
        }
        if (isNaN(tabletBP) || tabletBP < 641 || tabletBP > 1439) {
            showToast('Error: Tablet breakpoint must be between 641px and 1439px');
            return;
        }
        if (isNaN(desktopBP) || desktopBP < 768 || desktopBP > 2560) {
            showToast('Error: Desktop breakpoint must be between 768px and 2560px');
            return;
        }
        if (tabletBP <= mobileBP) {
            showToast('Error: Tablet breakpoint must be greater than mobile breakpoint');
            return;
        }

        try {
            let css = '';

            if (approach === 'mobile-first') {
                css = `/* ========================================
   Responsive Breakpoints (Mobile First)
   ======================================== */

/* Base styles (Mobile - 0 to ${mobileBP}px) */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* Tablet styles (${tabletBP}px and up) */
@media (min-width: ${tabletBP}px) {
  .container {
    max-width: ${tabletBP}px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
}

/* Desktop styles (${desktopBP}px and up) */
@media (min-width: ${desktopBP}px) {
  .container {
    max-width: ${desktopBP}px;
    padding: 0 2rem;
  }
}`;

                if (includeLargeDesktop) {
                    css += `

/* Large Desktop (1440px and up) */
@media (min-width: 1440px) {
  .container {
    max-width: 1440px;
  }
}`;
                }

                if (includeWide) {
                    css += `

/* Ultra Wide (1920px and up) */
@media (min-width: 1920px) {
  .container {
    max-width: 1800px;
  }
}`;
                }
            } else {
                css = `/* ========================================
   Responsive Breakpoints (Desktop First)
   ======================================== */

/* Base styles (Desktop - ${desktopBP}px and up) */
.container {
  max-width: ${desktopBP}px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Tablet styles (up to ${tabletBP}px) */
@media (max-width: ${tabletBP}px) {
  .container {
    max-width: ${tabletBP}px;
    padding: 0 1.5rem;
  }
}

/* Mobile styles (up to ${mobileBP}px) */
@media (max-width: ${mobileBP}px) {
  .container {
    width: 100%;
    padding: 0 1rem;
  }
}`;
            }

            // Render preview
            const devices = [
                { name: 'Mobile', width: Math.min(mobileBP - 40, 200), icon: '📱' },
                { name: 'Tablet', width: Math.min(Math.round((mobileBP + tabletBP) / 2 - 300), 320), icon: '📋' },
                { name: 'Desktop', width: Math.min(desktopBP - 600, 500), icon: '🖥️' }
            ];

            if (includeLargeDesktop) {
                devices.push({ name: 'Large Desktop', width: 560, icon: '🖥️' });
            }
            if (includeWide) {
                devices.push({ name: 'Ultra Wide', width: 640, icon: '🖥️' });
            }

            let previewHTML = '<div style="display: flex; flex-direction: column; gap: 16px; align-items: center; padding: 16px 0;">';
            devices.forEach(device => {
                previewHTML += `
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 4px;">${device.icon}</div>
                        <div style="border: 2px solid #cbd5e1; border-radius: 8px; height: 80px; width: ${device.width}px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">
                            ${device.name}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${device.name === 'Mobile' ? `0 - ${mobileBP}px` : device.name === 'Tablet' ? `${tabletBP}px+` : device.name === 'Desktop' ? `${desktopBP}px+` : device.name === 'Large Desktop' ? '1440px+' : '1920px+'}</div>
                    </div>
                `;
            });
            previewHTML += '</div>';
            previewEl.innerHTML = previewHTML;

            outputEl.textContent = css;
            resultEl.style.display = 'block';
            copyGroupEl.style.display = 'flex';
        } catch (error) {
            showToast('Error: ' + error.message);
        }
    }

    function clear() {
        mobileBreakpointEl.value = '640';
        tabletBreakpointEl.value = '1024';
        desktopBreakpointEl.value = '1025';
        approachEl.value = 'mobile-first';
        includeLargeDesktopEl.checked = false;
        includeWideEl.checked = false;
        previewEl.innerHTML = '';
        outputEl.textContent = '';
        resultEl.style.display = 'none';
        copyGroupEl.style.display = 'none';
        mobileBreakpointEl.focus();
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [mobileBreakpointEl, tabletBreakpointEl, desktopBreakpointEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') generate();
        });
    });
});
