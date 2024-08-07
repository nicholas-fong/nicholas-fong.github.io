//parseGPS.js
//import LatLon from './latlon-spherical.js'; better to import from mgrs.js
//import Utm from './utm.js';
//import LatLonEllipsoidal from './latlon-ellipsoidal.js'
import { LatLon } from './mgrs.js';

export function parseGPS(inputString) {
    // parse user input into latitude and longitude using regular expression
    const coordinates = inputString.split(/[,\s]+/);

    if (coordinates.length != 2) { 
    document.getElementById('message').textContent = "Please enter latitude, longitude"
    }
    else {
    const latitude = parseFloat(coordinates[0]);
    const longitude = parseFloat(coordinates[1]);
    console.log(`user_input: ${latitude}, ${longitude}`);
    document.getElementById('message').textContent = ""
        
    const p1 = new LatLon(latitude, longitude);
    console.log(p1.toString('dms'));
    console.log(p1.toString('dm'));
    document.getElementById('response1').textContent = p1.toString('dms');
    document.getElementById('response2').textContent = p1.toString('dm');

    const point = new LatLon(latitude, longitude);
    const utm = point.toUtm();
    const mgrs = utm.toMgrs();
    console.log(mgrs);  //Mgrs class object {zone: 10, band: 'U, etc}
    console.log(utm)
    document.getElementById('response3').textContent = mgrs
    document.getElementById('response4').textContent = utm

    // double check: convert MGRS back to latitude longitude
    const latlon_from_mgrs = mgrs.toUtm().toLatLon();
    console.log(`latlon from MGRS": ${latlon_from_mgrs.lat}, ${latlon_from_mgrs.lon}`);
      }
}
