// calculator2.js

// event listener for button submit
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    handleForm();
  });

function handleForm () {
    let principal = document.getElementById('principal').value;
    principal = principal.replace(/,/g,"");
    principal = parseFloat(principal);
    let finalAmount = document.getElementById('finalAmount').value;
    finalAmount = finalAmount.replace(/,/g,"");
    finalAmount = parseFloat(finalAmount);
    const years = parseFloat(document.getElementById('years').value, 10);
    const timesInput = document.getElementById('times').value;
    const times = timesInput === "" ? 1 : parseInt(timesInput, 10);
    const result = document.getElementById('result');    
    
    const rate = calculateAnnualInterestRate(principal, finalAmount, times, years);
    result.textContent = `Annualized ROI ${rate}%.`;
};

function calculateAnnualInterestRate (principal, finalAmount, times, years) {
    const rate = times * (Math.pow(finalAmount / principal, 1 / (times * years)) - 1) * 100;
    return rate.toFixed(2);
    //if times == 1; formula can be simplified to
    //rate = Math.pow(finalAmount / principal, 1 / duration) - 1;
    //interest = rate * 100;
    //alternate formula:
    //interest = (100*(Math.exp((Math.log(finalAmount)-Math.log(principal))/duration)-1))  ; 
};
