document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('interestform');
    const result = document.getElementById('result');
    const calculateButton = document.getElementById('calculate');

    const calculateAnnualInterestRate = (principal, finalAmount, times, years) => {
        const rate = times * (Math.pow(finalAmount / principal, 1 / (times * years)) - 1) * 100;
        return rate.toFixed(2);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        const principal = parseFloat(document.getElementById('principal').value);
        const finalAmount = parseFloat(document.getElementById('finalAmount').value);
        const years = parseInt(document.getElementById('years').value, 10);
        const times = parseInt(document.getElementById('times').value, 10);

        if (isNaN(principal) || isNaN(finalAmount) || isNaN(years) || isNaN(times)) {
            result.textContent = 'Please enter valid numbers in all fields.';
            return;
        }

        const rate = calculateAnnualInterestRate(principal, finalAmount, times, years);
        result.textContent = `The annual interest rate is ${rate}%.`;
    };

    calculateButton.addEventListener('click', handleFormSubmit);
});

