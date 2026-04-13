# Chi Square Calculator

Calculate the Chi-Square (χ²) statistic for goodness of fit tests.

## Features

- Input observed and expected values as comma-separated arrays
- Automatic calculation of Chi-Square statistic
- Degrees of freedom calculation
- P-value approximation using Wilson-Hilferty transformation
- Detailed breakdown of each category's contribution
- Statistical significance interpretation

## Formula

**Chi-Square Statistic:** χ² = Σ((O - E)² / E)

Where:
- O = Observed frequency
- E = Expected frequency

**Degrees of Freedom:** df = n - 1

Where n is the number of categories.

## Usage

1. Enter observed values as comma-separated numbers (e.g., `10, 15, 20, 25, 30`)
2. Enter expected values as comma-separated numbers (e.g., `12, 14, 18, 26, 30`)
3. Click "Calculate" to see the results

## Validation

- Both arrays must have the same length
- All expected values must be greater than 0
- At least 2 categories are required

## Output

- **Chi-Square Statistic (χ²)**: The test statistic
- **Degrees of Freedom (df)**: Number of categories minus 1
- **P-Value**: Approximate probability value
- **Interpretation**: Statistical significance assessment
- **Contributions Table**: Breakdown by category
