import Mgrs from './mgrs.js';
import { LatLon } from './mgrs.js';

export function parseMGRS(mgrsString) {

    const upper = mgrsString.toUpperCase();
    const cleanMGRS = upper.replace(/\s+/g, "");
    const pattern = new RegExp("^[0-9]{1,2}[^IO]{3}([0-9]{10}|[0-9]{8}|[0-9]{6}|[0-9]{4}|[0-9]{2})$");

    if (pattern.test(cleanMGRS)) {
        console.log(`clean up MGRS ${cleanMGRS}`);
        console.log("regex check passed")
        document.getElementById('message1').textContent = ""

        const mgrs = Mgrs.parse(cleanMGRS); 
        const LATLON = mgrs.toUtm().toLatLon();
        const latitude = LATLON.lat; 
        const longitude = LATLON.lon;

        const point = new LatLon(latitude, longitude);
        const utm = point.toUtm();
        const STD_UTM = `${utm['zone']} ${utm['hemisphere']} ${parseInt(utm['easting']).toString()} ${parseInt(utm ['northing']).toString()}   `;
        const NATO_UTM = `${utm['zone']} ${mgrs['band']} ${parseInt(utm['easting']).toString()} ${parseInt(utm ['northing']).toString()}` ;

        console.log(latitude, longitude);
        console.log(mgrs);
        console.log(utm);

        document.getElementById('response5').textContent = `${LATLON.lat.toFixed(5)},   ${LATLON.lon.toFixed(5)}` ;
        document.getElementById('response6').textContent = LATLON.toString();
        document.getElementById('response7').textContent = `UTM Band Notation:  ${NATO_UTM}`;
        document.getElementById('response8').textContent = `UTM Hemi Notation:  ${STD_UTM}`;
    } else {
        console.log("Invalid MGRS string.");
        document.getElementById('response5').textContent = "" ;
        document.getElementById('response6').textContent = "";
        document.getElementById('response7').textContent = "";
        document.getElementById('response8').textContent = "";
        document.getElementById('message1').textContent = "Invalid MGRS string, hit Refresh and try again"
    }
}
