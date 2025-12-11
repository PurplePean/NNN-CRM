import { stripCommas, formatCurrency } from './formatters';

/**
 * Calculate cost of capital (IRR) using Newton-Raphson
 */
export const calculateIRR = (cashFlows) => {
    // cashFlows array: [initial investment (negative), year 1, year 2, ..., year N]
    if (!cashFlows || cashFlows.length < 2) return 0;

    // Check if all cash flows are the same sign (no IRR exists)
    const allPositive = cashFlows.every(cf => cf >= 0);
    const allNegative = cashFlows.every(cf => cf <= 0);
    if (allPositive || allNegative) return 0;

    // NPV function for a given rate
    const npv = (rate) => {
        return cashFlows.reduce((sum, cf, index) => {
            return sum + cf / Math.pow(1 + rate, index);
        }, 0);
    };

    // Derivative of NPV for Newton-Raphson
    const npvDerivative = (rate) => {
        return cashFlows.reduce((sum, cf, index) => {
            if (index === 0) return sum;
            return sum - (index * cf) / Math.pow(1 + rate, index + 1);
        }, 0);
    };

    // Newton-Raphson iteration
    let guess = 0.1; // Start with 10% guess
    const maxIterations = 100;
    const tolerance = 0.00001;

    for (let i = 0; i < maxIterations; i++) {
        const npvValue = npv(guess);
        const npvDerivValue = npvDerivative(guess);

        // Avoid division by zero
        if (Math.abs(npvDerivValue) < 0.000001) break;

        const newGuess = guess - npvValue / npvDerivValue;

        // Check for convergence
        if (Math.abs(newGuess - guess) < tolerance) {
            return newGuess * 100; // Return as percentage
        }

        guess = newGuess;

        // Prevent unrealistic values
        if (guess < -0.99 || guess > 10) return 0;
    }

    return guess * 100; // Return as percentage
};

/**
 * Calculate monthly amortization payment
 */
export const calculateAmortizationPayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    return payment;
};

/**
 * Calculate remaining loan balance
 */
export const calculateRemainingBalance = (principal, annualRate, years, monthsPaid) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal - (principal / numPayments * monthsPaid);
    const monthlyPayment = calculateAmortizationPayment(principal, annualRate, years);
    const remainingBalance = principal * Math.pow(1 + monthlyRate, monthsPaid) -
        monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
    return Math.max(0, remainingBalance);
};

/**
 * Calculate comprehensive property metrics
 * @param {Object} prop - Property object
 * @param {Array} leases - Array of lease objects for calculation
 */
export const calculateMetrics = (prop, leases = []) => {
    // Parse inputs (strip commas)
    const sqft = parseFloat(stripCommas(prop.squareFeet)) || 0;

    // Use selected lease if available, otherwise fall back to property's monthlyBaseRentPerSqft
    let monthlyBaseRent = parseFloat(prop.monthlyBaseRentPerSqft) || 0;
    let selectedLease = null;
    let camPerSfMonth = 0;
    let tenantImprovementAmount = 0;
    let tenantAllowanceAmount = 0;
    let rentIncreaseType = 'none';
    let flatAnnualIncreasePercent = 0;
    let rentSteps = [];
    let baseAnnualEscalationPercent = 0;

    if (prop.selectedLeaseId) {
        selectedLease = leases.find(l => l.id === prop.selectedLeaseId);
        if (selectedLease) {
            monthlyBaseRent = parseFloat(selectedLease.pricePerSfMonth) || 0;

            // CAM charges
            if (selectedLease.camAmount && selectedLease.camType) {
                const camAmount = parseFloat(selectedLease.camAmount);
                if (selectedLease.camType === 'per_month') {
                    camPerSfMonth = camAmount;
                } else if (selectedLease.camType === 'per_year') {
                    camPerSfMonth = camAmount / 12;
                } else if (selectedLease.camType === 'total_annual' && sqft > 0) {
                    camPerSfMonth = (camAmount / sqft) / 12;
                }
            }

            // TI and Allowance
            tenantImprovementAmount = parseFloat(selectedLease.tenantImprovementAmount) || 0;
            tenantAllowanceAmount = parseFloat(selectedLease.tenantAllowanceAmount) || 0;

            // Rent increase structure
            rentIncreaseType = selectedLease.rentIncreaseType || 'none';
            flatAnnualIncreasePercent = parseFloat(selectedLease.flatAnnualIncreasePercent) || 0;
            rentSteps = selectedLease.rentSteps || [];
            baseAnnualEscalationPercent = parseFloat(selectedLease.baseAnnualEscalationPercent) || 0;
        }
    }

    const purchasePrice = parseFloat(stripCommas(prop.purchasePrice)) || 0;
    const improvements = parseFloat(stripCommas(prop.improvements)) || 0;
    const closingCosts = parseFloat(stripCommas(prop.closingCosts)) || 0;
    const ltvPercent = parseFloat(prop.ltvPercent) || 0;
    const interestRate = parseFloat(prop.interestRate) || 0;
    const loanTerm = parseFloat(prop.loanTerm) || 30;
    const debtServiceType = prop.debtServiceType || 'standard';
    const exitCapRate = parseFloat(prop.exitCapRate) || 0;
    const holdingPeriodMonths = parseFloat(prop.holdingPeriodMonths) || 0;

    // Calculate All-in Cost (including TI and Allowance)
    const allInCost = purchasePrice + improvements + closingCosts + tenantImprovementAmount + tenantAllowanceAmount;

    // Calculate Monthly & Annual Rent including CAM (NNN - no expenses)
    const monthlyRent = sqft * (monthlyBaseRent + camPerSfMonth);
    const annualRent = monthlyRent * 12;
    const noi = annualRent; // NNN: NOI = Rent since tenant pays expenses

    // Calculate Financing
    const loanAmount = allInCost * (ltvPercent / 100);
    const equityRequired = allInCost - loanAmount;

    // Calculate Debt Service
    let monthlyDebtService = 0;
    if (loanAmount > 0 && interestRate > 0) {
        if (debtServiceType === 'interestOnly') {
            monthlyDebtService = loanAmount * (interestRate / 100 / 12);
        } else {
            monthlyDebtService = calculateAmortizationPayment(loanAmount, interestRate, loanTerm);
        }
    }
    const annualDebtService = monthlyDebtService * 12;

    // Calculate Operating Metrics
    const dscr = monthlyDebtService > 0 ? (noi / 12) / monthlyDebtService : 0;
    const annualCashFlow = noi - annualDebtService;
    const capRate = allInCost > 0 ? (noi / allInCost) * 100 : 0;
    const cashOnCash = equityRequired > 0 ? (annualCashFlow / equityRequired) * 100 : 0;

    // Calculate Exit Metrics
    const exitValue = exitCapRate > 0 ? noi / (exitCapRate / 100) : 0;
    let remainingLoanBalance = loanAmount;
    if (debtServiceType === 'standard' && holdingPeriodMonths > 0 && interestRate > 0) {
        remainingLoanBalance = calculateRemainingBalance(loanAmount, interestRate, loanTerm, holdingPeriodMonths);
    }
    const netProceedsAtExit = exitValue - remainingLoanBalance;
    const equityMultiple = equityRequired > 0 ? netProceedsAtExit / equityRequired : 0;

    // Calculate IRR (Internal Rate of Return) with rent increases
    let irr = 0;
    if (holdingPeriodMonths > 0 && equityRequired > 0) {
        const holdingPeriodYears = holdingPeriodMonths / 12;
        const cashFlows = [];

        // Year 0: Initial equity investment (negative)
        cashFlows.push(-equityRequired);

        // Helper function to calculate rent for a given year based on increase structure
        const calculateYearRent = (year) => {
            let yearlyRent = annualRent; // Base rent for Year 1

            if (rentIncreaseType === 'flat_annual' && flatAnnualIncreasePercent > 0) {
                // Apply flat annual increase: rent * (1 + rate)^(year - 1)
                yearlyRent = annualRent * Math.pow(1 + (flatAnnualIncreasePercent / 100), year - 1);
            } else if (rentIncreaseType === 'stepped' && rentSteps.length > 0) {
                // Apply stepped increases
                let cumulativeIncrease = 1.0;
                let lastStepYear = 0;

                // Sort steps by trigger year
                const sortedSteps = [...rentSteps].sort((a, b) => a.triggerYear - b.triggerYear);

                for (const step of sortedSteps) {
                    if (step.triggerYear <= year) {
                        // Apply the step increase
                        cumulativeIncrease *= (1 + (step.increasePercent / 100));

                        // Apply base escalation between steps
                        if (baseAnnualEscalationPercent > 0 && lastStepYear > 0) {
                            const yearsBetween = step.triggerYear - lastStepYear;
                            cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), yearsBetween);
                        }

                        lastStepYear = step.triggerYear;
                    }
                }

                // Apply base escalation from last step to current year
                if (baseAnnualEscalationPercent > 0 && lastStepYear > 0 && year > lastStepYear) {
                    const yearsSinceLastStep = year - lastStepYear;
                    cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), yearsSinceLastStep);
                } else if (baseAnnualEscalationPercent > 0 && lastStepYear === 0) {
                    cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), year - 1);
                }

                yearlyRent = annualRent * cumulativeIncrease;
            } else if (rentIncreaseType === 'stepped_monthly' && rentSteps.length > 0) {
                const startMonth = (year - 1) * 12 + 1;
                const endMonth = year * 12;
                const sortedSteps = [...rentSteps].sort((a, b) => a.month - b.month);

                let totalYearRent = 0;
                for (let month = startMonth; month <= endMonth; month++) {
                    let pricePerSF = monthlyBaseRent;
                    for (let i = sortedSteps.length - 1; i >= 0; i--) {
                        if (sortedSteps[i].month <= month) {
                            pricePerSF = sortedSteps[i].pricePerSf;
                            break;
                        }
                    }
                    totalYearRent += pricePerSF * sqft;
                }
                yearlyRent = totalYearRent;
            }

            return yearlyRent;
        };

        // Years 1 through N: Annual cash flows with rent increases
        for (let year = 1; year <= Math.floor(holdingPeriodYears); year++) {
            const yearRent = calculateYearRent(year);
            const yearNOI = yearRent;
            const yearCashFlow = yearNOI - annualDebtService;
            cashFlows.push(yearCashFlow);
        }

        // Calculate final NOI for exit value
        const finalYear = Math.ceil(holdingPeriodYears);
        const finalYearRent = calculateYearRent(finalYear);
        const finalNOI = finalYearRent;
        const adjustedExitValue = exitCapRate > 0 ? finalNOI / (exitCapRate / 100) : 0;

        // Final year: Add exit proceeds to final cash flow
        if (cashFlows.length > 1) {
            cashFlows[cashFlows.length - 1] += (adjustedExitValue - remainingLoanBalance);
        } else {
            const yearRent = calculateYearRent(1);
            const yearNOI = yearRent;
            const yearCashFlow = yearNOI - annualDebtService;
            cashFlows.push(yearCashFlow * (holdingPeriodMonths / 12) + (adjustedExitValue - remainingLoanBalance));
        }

        irr = calculateIRR(cashFlows);
    }

    return {
        allInCost,
        monthlyRent,
        annualRent,
        noi,
        loanAmount,
        equityRequired,
        monthlyDebtService,
        annualDebtService,
        dscr,
        annualCashFlow,
        capRate,
        cashOnCash,
        exitValue,
        remainingLoanBalance,
        netProceedsAtExit,
        equityMultiple,
        irr
    };
};

/**
 * Generate sensitivity analysis table
 */
export const generateSensitivityTable = (property, rowVar, colVar, rowMin, rowMax, colMin, colMax, leases = []) => {
    const gridSize = 7; // 7x7 table

    // Define variable metadata
    const varMetadata = {
        monthlyBaseRentPerSqft: { label: 'Monthly Rent/SF', format: (v) => `$${v.toFixed(2)}`, isPercent: false },
        purchasePrice: { label: 'Purchase Price', format: (v) => `$${v.toLocaleString()}`, isPercent: false },
        improvements: { label: 'Improvements', format: (v) => `$${v.toLocaleString()}`, isPercent: false },
        closingCosts: { label: 'Closing Costs', format: (v) => `$${v.toLocaleString()}`, isPercent: false },
        ltvPercent: { label: 'LTV %', format: (v) => `${v.toFixed(1)}%`, isPercent: true },
        interestRate: { label: 'Interest Rate', format: (v) => `${v.toFixed(2)}%`, isPercent: true },
        exitCapRate: { label: 'Exit Cap Rate', format: (v) => `${v.toFixed(2)}%`, isPercent: true },
        holdingPeriodMonths: { label: 'Holding Period (months)', format: (v) => `${Math.round(v)}m`, isPercent: false }
    };

    // Parse min/max values
    const rowMinVal = parseFloat(rowMin) || 0;
    const rowMaxVal = parseFloat(rowMax) || 0;
    const colMinVal = parseFloat(colMin) || 0;
    const colMaxVal = parseFloat(colMax) || 0;

    if (rowMinVal >= rowMaxVal || colMinVal >= colMaxVal) {
        return null; // Invalid ranges
    }

    // Generate row and column values
    const rowStep = (rowMaxVal - rowMinVal) / (gridSize - 1);
    const colStep = (colMaxVal - colMinVal) / (gridSize - 1);

    const rowValues = Array.from({ length: gridSize }, (_, i) => rowMinVal + (i * rowStep));
    const colValues = Array.from({ length: gridSize }, (_, i) => colMinVal + (i * colStep));

    // Generate table data
    const tableData = rowValues.map(rowVal => {
        return colValues.map(colVal => {
            // Create modified property
            const modifiedProp = {
                ...property,
                [rowVar]: rowVar === 'monthlyBaseRentPerSqft' ? rowVal.toFixed(2) : rowVal.toString(),
                [colVar]: colVar === 'monthlyBaseRentPerSqft' ? colVal.toFixed(2) : colVal.toString()
            };

            // Calculate metrics for this scenario
            const metrics = calculateMetrics(modifiedProp, leases);

            return {
                rowVal,
                colVal,
                equityMultiple: metrics.equityMultiple,
                dscr: metrics.dscr,
                cashOnCash: metrics.cashOnCash,
                capRate: metrics.capRate,
                annualCashFlow: metrics.annualCashFlow,
                netProceedsAtExit: metrics.netProceedsAtExit,
                noi: metrics.noi,
                irr: metrics.irr
            };
        });
    });

    return {
        rowValues,
        colValues,
        tableData,
        rowVar,
        colVar,
        rowLabel: varMetadata[rowVar]?.label || rowVar,
        colLabel: varMetadata[colVar]?.label || colVar,
        rowFormat: varMetadata[rowVar]?.format || ((v) => v.toFixed(2)),
        colFormat: varMetadata[colVar]?.format || ((v) => v.toFixed(2))
    };
};
