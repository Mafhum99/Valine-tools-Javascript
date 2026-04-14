# Newton's Method Calculator

Find roots of equations using Newton's Method with step-by-step iteration tracking.

## Formula

Newton's Method iteratively approximates roots using:

```
x(n+1) = x(n) − f(x(n)) / f'(x(n))
```

## Features

- **Symbolic or numerical derivative**: Enter f'(x) manually, or leave it empty for automatic numerical differentiation
- **Configurable parameters**: Set initial guess (x₀), tolerance, and maximum iterations
- **Iteration table**: View every step with n, xₙ, f(xₙ), f'(xₙ), and error
- **Status detection**: Automatically detects convergence, divergence, zero-derivative failures, and max-iteration limits

## Usage

1. Enter your function f(x) (e.g., `x^2 - 4`, `sin(x) - x/2`, `exp(x) - 3`)
2. Optionally enter the derivative f'(x) (e.g., `2*x`, `cos(x) - 1/2`, `exp(x)`)
3. Set the initial guess x₀, tolerance (default: 1e-6), and max iterations (default: 100)
4. Click **Find Root**

## Supported Functions

| Syntax | Description |
|--------|-------------|
| `sin(x)`, `cos(x)`, `tan(x)` | Trigonometric |
| `asin(x)`, `acos(x)`, `atan(x)` | Inverse trigonometric |
| `sqrt(x)`, `cbrt(x)` | Square / cube root |
| `abs(x)` | Absolute value |
| `log(x)` | Natural logarithm |
| `log10(x)`, `log2(x)` | Base-10 / base-2 logarithm |
| `exp(x)` | Exponential e^x |
| `pi`, `e` | Constants π and e |
| `x^2`, `x^3` | Powers (use `^` or `**`) |

Implicit multiplication is supported: `2x` is interpreted as `2*x`.

## Examples

| f(x) | f'(x) | x₀ | Root |
|------|-------|-----|------|
| `x^2 - 4` | `2*x` | 3 | 2 |
| `x^3 - x - 2` | `3*x^2 - 1` | 1.5 | ~1.5214 |
| `sin(x) - x/2` | `cos(x) - 1/2` | 2 | ~1.8955 |
| `exp(x) - 3` | _(empty)_ | 1 | ~1.0986 |

## Files

- `index.html` — Tool UI
- `script.js` — Full boilerplate + Newton's method logic with expression parser
- `style.css` — Styling with iteration table, status badges, responsive layout
- `README.md` — This file
