// calculator2.js
function handleForm () {
    const principal = parseFloat(document.getElementById('principal').value);
    const finalAmount = parseFloat(document.getElementById('finalAmount').value);
    const years = parseInt(document.getElementById('years').value, 10);
    const timesInput = document.getElementById('times').value;
    const result = document.getElementById('result'); // Ensure result is defined

    // Check if "times" input is empty (using strict equality) and set it to 1 if empty
    // use ternary (or conditional) operator: condition ? exprIfTrue : exprIfFalse
    const times = timesInput === "" ? 1 : parseInt(timesInput, 10);

    if (isNaN(principal) || isNaN(finalAmount) || isNaN(years) || isNaN(times)) {
        result.textContent = 'Please enter valid numbers in Principal, Final Amount, Years';
        return;
    }

    const rate = calculateAnnualInterestRate(principal, finalAmount, times, years);
    result.textContent = `The annual interest rate is ${rate}%.`;
};

function calculateAnnualInterestRate (principal, finalAmount, times, years) {
    const rate = times * (Math.pow(finalAmount / principal, 1 / (times * years)) - 1) * 100;
    return rate.toFixed(2);
};

// Add event listener for the button click
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('buttonId').addEventListener('click', handleForm);
});

