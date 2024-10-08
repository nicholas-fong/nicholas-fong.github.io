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

function findAndDisplayPrimes(num) {
    const primesNearNum = findNearbyPrimes(num, 200);
    
    document.getElementById("display").innerHTML = `Prime numbers near ${num}:<br><br>${primesNearNum.join(", ")}`;
    
    if (isPrime(num)) {
        document.getElementById("response").innerHTML = `<strong>${num}</strong> is a prime.`; 
    }; 
}

