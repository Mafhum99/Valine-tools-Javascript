# Euler's Method Calculator

> **Category**: Math Tools
> **Folder**: `eulers method calculator`

## 📝 Description
**How it works:** Solves first-order ordinary differential equations (ODEs) numerically using Euler's method. The formula y(n+1) = y(n) + h × f(t(n), y(n)) iteratively computes approximate values of y at each time step.

## 🚀 How to Use
1. Open `index.html` in your browser
2. Enter the ODE function f(t, y) as a string expression (e.g., `t + y`, `-2*y`, `sin(t) + y`)
3. Set the initial condition y(t₀) = y₀
4. Specify start time (t₀), end time (t₁), and step size (h)
5. Click Calculate
6. View results in the table and text output
7. Copy results if needed

## 📁 File Structure
```
eulers method calculator/
├── index.html      # Main UI interface
├── script.js       # Calculation logic and utility functions
├── style.css       # Custom styling
└── README.md       # This file
```

## ⚡ Features
- Parse ODE functions from string input (supports sin, cos, exp, log, sqrt, etc.)
- Numerical solution via Euler's method: y(n+1) = y(n) + h × f(t(n), y(n))
- Input validation:
  - Step size must be positive
  - Start time must be less than end time
  - Function must be parseable
  - Checks if (t₁ - t₀) is divisible by h (with suggestion if not)
- Results displayed as both an HTML table and plain text
- Copy results to clipboard
- Mobile responsive design
- Error handling for invalid inputs
- Clean, modern UI

## 🛠️ Technical Details
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with CSS variables
- **JavaScript (ES6+)** - No dependencies
- **Standalone** - All assets self-contained

## 📐 Supported Functions
The ODE function f(t, y) supports:
- Basic arithmetic: `+`, `-`, `*`, `/`, `^` (power)
- Math functions: `sin`, `cos`, `tan`, `exp`, `log`, `sqrt`, `abs`
- Constants: `pi` (π), `e` (Euler's number)
- Variables: `t` (independent), `y` (dependent)

Examples: `t + y`, `-2*y`, `t*y`, `sin(t) + y`, `t^2 - y`, `exp(-t)*y`

## 🐛 Troubleshooting
If you encounter issues:
1. Check browser console (F12) for errors
2. Ensure JavaScript is enabled
3. Try clearing browser cache
4. Verify all files are present in folder
5. Ensure function uses correct syntax (e.g., `2*y` not `2y`)

## 📊 Related Tools
Check the Differential Equation Solver in the parent directory for additional methods (RK4).

---
*Created on 2026-04-14*
