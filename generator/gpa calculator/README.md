# GPA Calculator

> **Category**: Math Tools
> **Project Number**: 841
> **Folder**: `841_gpa-calculator`

## 📝 Description
**How it works:** Calculates Grade Point Average (GPA) from course grades and credit hours. Add courses dynamically with name, letter grade (A through F), and credit hours. The GPA is computed using the formula: GPA = sum(grade_point x credits) / sum(credits).

**Grade Point Mapping:**
- A = 4.0, A- = 3.7
- B+ = 3.3, B = 3.0, B- = 2.7
- C+ = 2.3, C = 2.0, C- = 1.7
- D+ = 1.3, D = 1.0
- F = 0.0


## 🚀 How to Use
1. Open `index.html` in your browser
2. Click "+ Add Course" to add as many courses as needed
3. Enter course name, select letter grade, and input credit hours
4. Click Calculate GPA button
5. View cumulative GPA, total credits, quality points, and grade breakdown
6. Copy results if needed

## Features
- Dynamic course addition/removal
- Cumulative GPA calculation with color-coded display
- Total credits and quality points summary
- Grade distribution breakdown table
- Per-course summary with points
- Input validation (at least one course, positive credits, valid grades)
- LocalStorage persistence of course data
- Mobile responsive design
- Copy results to clipboard

## 📁 File Structure
```
841_gpa-calculator/
├── index.html      # Main UI interface
├── script.js       # Calculation logic
├── style.css       # Custom styling
└── README.md       # This file
```

## ⚡ Features
- Real-time calculations
- Mobile responsive design
- Copy results to clipboard
- Step-by-step solutions
- Error handling for invalid inputs
- Clean, modern UI

## 🛠️ Technical Details
- **HTML5** - Semantic markup
- **CSS3** - Responsive design
- **JavaScript (ES6+)** - No dependencies
- **Standalone** - All assets self-contained (no shared.css/js required)

## 🐛 Troubleshooting
If you encounter issues:
1. Check browser console (F12) for errors
2. Ensure JavaScript is enabled
3. Try clearing browser cache
4. Verify all files are present in folder

## 📊 Related Tools
Check other math tools in the parent directory for complementary functionality.

---
*Auto-generated on 2026-04-06*
