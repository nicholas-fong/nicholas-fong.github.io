// calculator2.js

// event listener for button submit
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    handleForm();
  });

function handleForm () {
    const principal = parseFloat(document.getElementById('principal').value);
    const finalAmount = parseFloat(document.getElementById('finalAmount').value);
    const years = parseFloat(document.getElementById('years').value, 10);
    const timesInput = document.getElementById('times').value;
    const result = document.getElementById('result'); // Ensure result is defined

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
