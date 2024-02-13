function isPrime(number) {
    if (number < 2) {
        return false;
    }
    if (number === 2) {
        return true;
    }
    for (let divisor = 2; divisor <= Math.sqrt(number); divisor++) {
        if (number % divisor === 0) {
            return false;
        }
    }
    return true;
}

function findNearbyPrimes(target, limit) {
    if (target < 2) {
        return [];
    }
    const primes = [];
    if (isPrime(target)) {
        primes.push(target); // Include target if it is prime
    }
    let smallerPrime = null;
    let largerPrime = null;
    
    let count = 5;
    for (let num = target - 1; num > target - limit - 1; num--) {
        if (isPrime(num)) {
            smallerPrime = num;
            primes.push(smallerPrime);
            count -= 1;
            if (count === 0) {
                break;
            }
        }
    }
    
    count = 5;
    for (let num = target + 1; num < target + limit + 1; num++) {
        if (isPrime(num)) {
            largerPrime = num;
            primes.push(largerPrime);
            count -= 1;
            if (count === 0) {
                break;
            }
        }
    }
    return primes.sort((a, b) => a - b);
}

function findAndDisplayPrimes() {
    // parse user input string to an Integer
    const num = parseInt(document.getElementById("numberInput").value);
    const primesNearNum = findNearbyPrimes(num, 200);

    // send results to HTML
    document.getElementById("display").innerHTML = `<br>Prime numbers near ${num}:<br><br>${primesNearNum.join(", ")}`;
    if (isPrime(num)) {
        document.getElementById("notice").innerHTML = `Your number <em>${num}</em> is a prime<br>hit F5/refresh for another prime calculation`; 
    }; 
}

