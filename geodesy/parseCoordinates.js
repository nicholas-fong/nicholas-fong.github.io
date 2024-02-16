//parseCoordinates.js
//import LatLon from './latlon-spherical.js'; better from mgrs.js
//import Utm from './utm.js';
//import LatLonEllipsoidal from './latlon-ellipsoidal.js'
import { LatLon } from './mgrs.js';

export function parseCoordinates(inputString) {
    // Split the input into latitude and longitude using a regular expression
    var coordinates = inputString.split(/[,\s]+/);
  
    // Check if there are two parts (latitude and longitude)
    if (coordinates.length === 2) {
      // Convert latitude and longitude to floats
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
    // now calculations and logics using mgrs modules and user input latitude longitude  
    const p1 = new LatLon(latitude, longitude);
    console.log(p1.toString('dms'));
    console.log(p1.toString('dm'));
    document.getElementById('response1').textContent = p1.toString('dms');
    document.getElementById('response2').textContent = p1.toString('dm');

    const point = new LatLon(latitude, longitude);
    const utm = point.toUtm();
    const mgrs = utm.toMgrs();
    console.log(mgrs);
    console.log(utm)
    document.getElementById('response3').textContent = mgrs
    document.getElementById('response4').textContent = utm
}
  
