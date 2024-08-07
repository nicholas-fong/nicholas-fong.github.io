// java style, define a class with a method, that is the static fucntion haversineDistance
// to call the function: class_name.function(parameters)

class HaversineCalculator {
    static haversineDistance(lat1, lon1, lat2, lon2) {
        const radius = 6371000.0; // Earth's radius in meters
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        // Haversine formula
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c; // Distance in meters
    }
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function calculateDistance() {
    const coord1 = document.getElementById('coord1').value;
    const coord2 = document.getElementById('coord2').value;
    
    const coordinates1 = coord1.split(/[,\s]+/).map(Number);
    const coordinates2 = coord2.split(/[,\s]+/).map(Number);

    const lat1 = (coordinates1[0]);
    const lon1 = (coordinates1[1]);
    const lat2 = (coordinates2[0]);
    const lon2 = (coordinates2[1]);

    if (coordinates1.length !== 2 || coordinates2.length !== 2) { 
        document.getElementById('message').textContent = "Please enter latitude, longitude";
    } else {
        document.getElementById('message').textContent = "";
        const distance = HaversineCalculator.haversineDistance(lat1, lon1, lat2, lon2);
        let resultText;
        if (distance < 1000) {
            resultText = `Distance: ${distance.toFixed(1)} meters`;
        } else {
            resultText = `Distance: ${(distance / 1000).toFixed(1)} kilometers`;
        }
        document.getElementById('result').textContent = resultText;
    }   
}

// Add event listener for the button
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('calculateButton').addEventListener('click', calculateDistance);
});
