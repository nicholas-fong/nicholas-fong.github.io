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
    document.getElementById('message2').textContent = "Please enter valid latitude, longitude"
    document.getElementById('response1').textContent = "";
    document.getElementById('response2').textContent = "";
    document.getElementById('response3').textContent = "";
    document.getElementById('response4').textContent = "";
    document.getElementById('response4A').textContent = "";
    }
    else {
    const latitude = parseFloat(coordinates[0]);
    const longitude = parseFloat(coordinates[1]);
    console.log(`user_input: ${latitude}, ${longitude}`);
    document.getElementById('message2').textContent = "";
        
    const p1 = new LatLon(latitude, longitude);
    console.log(p1.toString('dms'));
    console.log(p1.toString('dm'));
    document.getElementById('response1').textContent = `DMS: ${p1.toString('dms')}`;
    document.getElementById('response2').textContent = `DM: ${p1.toString('dm')}`;

    const point = new LatLon(latitude, longitude);
    const utm = point.toUtm();
    const mgrs = utm.toMgrs();
    console.log(mgrs);
    console.log(utm);
    const NATO_UTM = `${utm['zone']} ${mgrs['band']} ${parseInt(utm['easting']).toString()} ${parseInt(utm ['northing']).toString()}` ;
    console.log ( NATO_UTM )
    document.getElementById('response3').textContent = `MGRS: ${mgrs.toString(10).replace(/ /g, '')}`;
    document.getElementById('response4').textContent =  `UTM Hemi notation ${utm}`;
    document.getElementById('response4A').textContent = `UTM Band notation ${NATO_UTM} `;

    // double back check: convert MGRS back to latitude longitude
    const latlon_from_mgrs = mgrs.toUtm().toLatLon();
    console.log(`double back: latlon from MGRS": ${latlon_from_mgrs.lat}, ${latlon_from_mgrs.lon}`);
    }
}
