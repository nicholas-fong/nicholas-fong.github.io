// calculator3.js
import { calculateAnnualInterestRate } from './utilities.js';

document.getElementById('buttonId').addEventListener('click', (event)=> { 
    event.preventDefault(); 
    handleForm(); 
    } );

function handleForm () {
    const principal = parseFloat(document.getElementById('principal').value);
    const finalAmount = parseFloat(document.getElementById('finalAmount').value);
    const years = parseInt(document.getElementById('years').value, 10);
    const timesInput = document.getElementById('times').value;
    const result = document.getElementById('result');

    // Check if "times" input is empty (using strict equality) and set it to 1 if empty
    // use ultra compact ternary operator (conditional operator): condition ? exprIfTrue : exprIfFalse
    const times = timesInput === "" ? 1 : parseInt(timesInput, 10);

    if (isNaN(principal) || isNaN(finalAmount) || isNaN(years) || isNaN(times)) {
        result.textContent = 'Please enter valid numbers in Principal, Final Amount, Years';
        return;
    }
    const rate = calculateAnnualInterestRate(principal, finalAmount, times, years);
    result.textContent = `The annual interest rate is ${rate}%.`;
};
