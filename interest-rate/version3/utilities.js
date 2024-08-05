// utilities.js
export const calculateAnnualInterestRate = (principal, finalAmount, times, years) => {
    const rate = times * (Math.pow(finalAmount / principal, 1 / (times * years)) - 1) * 100;
    return rate.toFixed(2);
};
