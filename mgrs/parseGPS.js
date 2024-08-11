//parseGPS.js
//import LatLon from './latlon-spherical.js'; better to import from mgrs.js
//import Utm from './utm.js';
//import LatLonEllipsoidal from './latlon-ellipsoidal.js'
import { LatLon } from './mgrs.js';

export function parseGPS(inputString) {
    const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,?\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    const coordinates = inputString.split(/[,\s]+/);
    
    console.log(inputString)
    console.log("regex", regex.test(inputString))
    
    if (!regex.test(inputString)) { 
    document.getElementById('message1').textContent = "Please enter latitude, longitude after hitting Refresh"
    document.getElementById('response1').textContent = "";
    document.getElementById('response2').textContent = "";
    document.getElementById('response3').textContent = "";
    document.getElementById('response4').textContent = "";
    }
    else {
    const latitude = parseFloat(coordinates[0]);
    const longitude = parseFloat(coordinates[1]);
    console.log(`user_input: ${latitude}, ${longitude}`);
    document.getElementById('message1').textContent = " ";
        
    const p1 = new LatLon(latitude, longitude);
    console.log(p1.toString('dms'));
    console.log(p1.toString('dm'));
    document.getElementById('response1').textContent = p1.toString('dms');
    document.getElementById('response2').textContent = p1.toString('dm');

    const point = new LatLon(latitude, longitude);
    const utm = point.toUtm();
    const mgrs = utm.toMgrs();
    console.log(mgrs);
    console.log(utm);
    document.getElementById('response3').textContent = mgrs.toString(10).replace(/ /g, '');
    document.getElementById('response4').textContent = utm;

    // double back check: convert MGRS back to latitude longitude
    const latlon_from_mgrs = mgrs.toUtm().toLatLon();
    console.log(`latlon from MGRS": ${latlon_from_mgrs.lat}, ${latlon_from_mgrs.lon}`);
    }
}
