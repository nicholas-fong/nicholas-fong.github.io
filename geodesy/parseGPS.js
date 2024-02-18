//parseGPS.js
import  { LatLon } from './mgrs.js';

export function parseGPS(inputString) {
    // Split the input into latitude and longitude
    var coordinates = inputString.split(/[,\s]+/);
  
    if (coordinates.length === 2) {
      var latitude = parseFloat(coordinates[0]);
      var longitude = parseFloat(coordinates[1]);
  
      // Check if conversion was successful
      if (!isNaN(latitude) && !isNaN(longitude)) {
        console.log("Latitude: " + latitude + ", Longitude: " + longitude);
        // You can now use the latitude and longitude variables as needed
      } else {
        console.log("Invalid coordinates. Please enter valid numbers.");
      }
    } else {
      console.log("Invalid input format. Please enter coordinates separated by a comma or whitespace.");
    }
    // calculations using mgrs module  
    const point = new LatLon(latitude, longitude);
    
    document.getElementById('response1').textContent = point.toString('dms');
    document.getElementById('response2').textContent = point.toString('dm');

    console.log(point.toString('dms'));
    console.log(point.toString('dm'));

    const utm = point.toUtm();
    const mgrs = utm.toMgrs();

    document.getElementById('response3').textContent = mgrs
    document.getElementById('response4').textContent = utm    
    
    console.log(mgrs);
    console.log(utm);

}
  
