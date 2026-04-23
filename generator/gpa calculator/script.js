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
// Storage Helpers (localStorage)
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

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
// Number Formatting
// ========================================
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatPercent(value, decimals = 2) {
    return formatNumber(value * 100, decimals) + '%';
}

// ========================================
// Math Utilities
// ========================================
function percentage(part, whole) { return (part / whole) * 100; }
function percentageOf(percent, whole) { return (percent / 100) * whole; }
function percentageChange(oldValue, newValue) { return ((newValue - oldValue) / Math.abs(oldValue)) * 100; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function lerp(start, end, t) { return start + (end - start) * t; }
function mapRange(value, inMin, inMax, outMin, outMax) { return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin; }

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function titleCase(str) { return str.toLowerCase().replace(/\b\w/g, capitalize); }
function camelCase(str) { return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()); }
function snakeCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('_').toLowerCase() || str.toLowerCase(); }
function kebabCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('-').toLowerCase() || str.toLowerCase(); }

// ========================================
// Date Utilities
// ========================================
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    return format.replace('YYYY', d.getFullYear()).replace('MM', String(d.getMonth() + 1).padStart(2, '0')).replace('DD', String(d.getDate()).padStart(2, '0')).replace('HH', String(d.getHours()).padStart(2, '0')).replace('mm', String(d.getMinutes()).padStart(2, '0')).replace('ss', String(d.getSeconds()).padStart(2, '0'));
}
function daysBetween(date1, date2) { const oneDay = 24 * 60 * 60 * 1000; return Math.round(Math.abs((date1 - date2) / oneDay)); }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

// ========================================
// Color Utilities
// ========================================
const Color = {
    rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); },
    hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; },
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
    random() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); }
};

// ========================================
// Random Utilities
// ========================================
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 2) { return Number((Math.random() * (max - min) + min).toFixed(decimals)); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomString(length = 10, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ========================================
// Debounce & Throttle
// ========================================
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
}

// ========================================
// Validation
// ========================================
function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
function isURL(str) { try { new URL(str); return true; } catch { return false; } }
function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * GPA Calculator
 * Calculate grade point average from courses with letter grades and credit hours.
 * Grade point mapping: A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0
 * Formula: GPA = sum(grade_point * credits) / sum(credits)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'GPA Calculator', icon: '🎓' });

    // Grade point mapping
    const GRADE_POINTS = {
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'F': 0.0
    };

    const VALID_GRADES = Object.keys(GRADE_POINTS);

    // DOM references
    const coursesContainer = $('#courses-container');
    const addCourseBtn = $('#add-course');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');
    const gradeBreakdownEl = $('#grade-breakdown');

    // Course counter for unique IDs
    let courseCount = 0;

    /**
     * Create a single course row with name, grade select, and credits input
     */
    function createCourseRow() {
        courseCount++;
        const id = courseCount;

        const row = createElement('div', { className: 'course-row' }, [
            createElement('div', { className: 'course-name' }, [
                createElement('input', {
                    type: 'text',
                    className: 'form-input',
                    placeholder: 'Course name',
                    id: `course-name-${id}`
                })
            ]),
            createElement('div', { className: 'course-grade' }, [
                createElement('select', {
                    className: 'form-select',
                    id: `course-grade-${id}`
                }, VALID_GRADES.map(grade => {
                    return createElement('option', {
                        value: grade,
                        textContent: grade
                    });
                }))
            ]),
            createElement('div', { className: 'course-credits' }, [
                createElement('input', {
                    type: 'number',
                    className: 'form-input',
                    placeholder: 'Credits',
                    id: `course-credits-${id}`,
                    min: '0.5',
                    step: '0.5'
                })
            ]),
            createElement('div', { className: 'course-actions' }, [
                createElement('button', {
                    type: 'button',
                    className: 'btn-remove',
                    title: 'Remove course',
                    onClick: () => {
                        const allRows = $$('.course-row');
                        if (allRows.length > 1) {
                            row.remove();
                        } else {
                            showToast('At least one course is required');
                        }
                    }
                }, ['Remove'])
            ])
        ]);

        coursesContainer.appendChild(row);
        return row;
    }

    /**
     * Collect all course data from the DOM
     */
    function getCourses() {
        const rows = $$('.course-row');
        const courses = [];

        rows.forEach((row, index) => {
            const nameEl = row.querySelector(`[id^="course-name-"]`);
            const gradeEl = row.querySelector(`[id^="course-grade-"]`);
            const creditsEl = row.querySelector(`[id^="course-credits-"]`);

            courses.push({
                name: nameEl ? nameEl.value.trim() : '',
                grade: gradeEl ? gradeEl.value : '',
                credits: creditsEl ? parseFloat(creditsEl.value) : NaN,
                index: index + 1
            });
        });

        return courses;
    }

    /**
     * Validate courses and return errors array
     */
    function validateCourses(courses) {
        const errors = [];

        if (courses.length === 0) {
            errors.push('At least one course is required');
            return errors;
        }

        courses.forEach(course => {
            if (!course.name) {
                errors.push(`Course ${course.index}: Name is required`);
            }

            if (!VALID_GRADES.includes(course.grade)) {
                errors.push(`Course ${course.index}: Invalid letter grade`);
            }

            if (isNaN(course.credits) || course.credits <= 0) {
                errors.push(`Course ${course.index}: Credits must be a positive number`);
            }
        });

        return errors;
    }

    /**
     * Calculate GPA from validated courses
     */
    function calculateGPA(courses) {
        let totalQualityPoints = 0;
        let totalCredits = 0;
        const gradeBreakdown = {};

        courses.forEach(course => {
            const gradePoint = GRADE_POINTS[course.grade];
            const qualityPoints = gradePoint * course.credits;
            totalQualityPoints += qualityPoints;
            totalCredits += course.credits;

            // Track grade distribution
            if (!gradeBreakdown[course.grade]) {
                gradeBreakdown[course.grade] = { count: 0, credits: 0 };
            }
            gradeBreakdown[course.grade].count++;
            gradeBreakdown[course.grade].credits += course.credits;
        });

        const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

        return {
            gpa,
            totalCredits,
            totalQualityPoints,
            gradeBreakdown,
            courseCount: courses.length
        };
    }

    /**
     * Render results to the output area
     */
    function renderResults(result, courses) {
        // Format GPA with appropriate classification
        let gpaClass = '';
        if (result.gpa >= 3.5) gpaClass = 'gpa-excellent';
        else if (result.gpa >= 3.0) gpaClass = 'gpa-good';
        else if (result.gpa >= 2.0) gpaClass = 'gpa-average';
        else gpaClass = 'gpa-below';

        // Build raw text for copying
        let rawText = `GPA Calculator Results:\n`;
        rawText += `Cumulative GPA: ${formatNumber(result.gpa, 3)}\n`;
        rawText += `Total Credits: ${formatNumber(result.totalCredits, 1)}\n`;
        rawText += `Total Quality Points: ${formatNumber(result.totalQualityPoints, 2)}\n\n`;
        rawText += `Courses:\n`;
        courses.forEach((c, i) => {
            rawText += `${i+1}. ${c.name}: ${c.grade} (${c.credits} credits)\n`;
        });

        // Build output HTML
        let outputHTML = '';
        outputHTML += `<div class="gpa-display ${gpaClass}">`;
        outputHTML += `<div class="gpa-value">${formatNumber(result.gpa, 3)}</div>`;
        outputHTML += `<div class="gpa-label">Cumulative GPA</div>`;
        outputHTML += `</div>`;
        outputHTML += `<div class="gpa-stats">`;
        outputHTML += `<div class="stat"><span class="stat-value">${result.courseCount}</span><span class="stat-label">Courses</span></div>`;
        outputHTML += `<div class="stat"><span class="stat-value">${formatNumber(result.totalCredits, 1)}</span><span class="stat-label">Total Credits</span></div>`;
        outputHTML += `<div class="stat"><span class="stat-value">${formatNumber(result.totalQualityPoints, 2)}</span><span class="stat-label">Quality Points</span></div>`;
        outputHTML += `</div>`;

        outputEl.innerHTML = outputHTML;
        outputEl.dataset.rawResult = rawText;

        // Grade breakdown
        let breakdownHTML = '<table class="breakdown-table"><thead><tr><th>Grade</th><th>Count</th><th>Credits</th><th>Points</th></tr></thead><tbody>';

        // Sort grades in order
        VALID_GRADES.forEach(grade => {
            if (result.gradeBreakdown[grade]) {
                const data = result.gradeBreakdown[grade];
                const points = (GRADE_POINTS[grade] * data.credits).toFixed(2);
                breakdownHTML += `<tr><td class="grade-cell">${grade}</td><td>${data.count}</td><td>${formatNumber(data.credits, 1)}</td><td>${points}</td></tr>`;
            }
        });

        breakdownHTML += '</tbody></table>';

        // Course summary table
        breakdownHTML += '<table class="breakdown-table course-summary"><thead><tr><th>#</th><th>Course</th><th>Grade</th><th>Credits</th><th>Points</th></tr></thead><tbody>';

        courses.forEach((course, index) => {
            const points = (GRADE_POINTS[course.grade] * course.credits).toFixed(2);
            breakdownHTML += `<tr><td>${index + 1}</td><td>${course.name || '-'}</td><td class="grade-cell">${course.grade}</td><td>${formatNumber(course.credits, 1)}</td><td>${points}</td></tr>`;
        });

        breakdownHTML += '</tbody></table>';

        gradeBreakdownEl.innerHTML = breakdownHTML;
    }

    /**
     * Main calculate handler
     */
    function calculate() {
        const courses = getCourses();
        const errors = validateCourses(courses);

        if (errors.length > 0) {
            outputEl.innerHTML = `<div class="error-list"><strong>Validation Errors:</strong><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
            gradeBreakdownEl.innerHTML = '';
            return;
        }

        try {
            const result = calculateGPA(courses);
            renderResults(result, courses);

            // Save to localStorage
            Storage.set('gpa-courses', courses);
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            gradeBreakdownEl.innerHTML = '';
        }
    }

    /**
     * Clear all courses and reset
     */
    function clear() {
        coursesContainer.innerHTML = '';
        courseCount = 0;
        createCourseRow();
        outputEl.innerHTML = '-';
        delete outputEl.dataset.rawResult;
        gradeBreakdownEl.innerHTML = '';
    }

    /**
     * Load saved courses from localStorage
     */
    function loadSavedCourses() {
        const saved = Storage.get('gpa-courses', null);
        if (saved && saved.length > 0) {
            saved.forEach(course => {
                const row = createCourseRow();
                const nameEl = row.querySelector(`[id^="course-name-"]`);
                const gradeEl = row.querySelector(`[id^="course-grade-"]`);
                const creditsEl = row.querySelector(`[id^="course-credits-"]`);

                if (nameEl) nameEl.value = course.name;
                if (gradeEl) gradeEl.value = course.grade;
                if (creditsEl) creditsEl.value = course.credits;
            });
        } else {
            // Add one empty course row by default
            createCourseRow();
        }
    }

    // Initialize
    loadSavedCourses();

    // Event listeners
    addCourseBtn.addEventListener('click', () => {
        createCourseRow();
    });

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = outputEl.dataset.rawResult || outputEl.textContent;
            if (textToCopy === '-') return;
            copyToClipboard(textToCopy);
        });
    }
});
