//parseMGRS.js
import Mgrs from './mgrs.js';

export function parseMGRS(mgrsString) {

    const upper = mgrsString.toUpperCase();
    const cleanMGRS = upper.replace(/\s+/g, "");
    console.log("cleaned up", cleanMGRS)  

    const pattern = new RegExp("^[0-9]{1,2}[^IO]{3}([0-9]{10}|[0-9]{8}|[0-9]{6}|[0-9]{4}|[0-9]{2})$");
    if (pattern.test(cleanMGRS)) {
        console.log("regex passed")
        document.getElementById('message').textContent = ""

        const mgrs = Mgrs.parse(cleanMGRS);
        const LATLON = mgrs.toUtm().toLatLon();

        document.getElementById('response1').textContent = `${LATLON.lat.toFixed(5)},   ${LATLON.lon.toFixed(5)}` ;
        document.getElementById('response2').textContent = LATLON.toString();
        document.getElementById('message').textContent = `MGRS:  ${cleanMGRS}`;
    } else {
        console.log("Invalid MGRS string.");
        document.getElementById('message').textContent = "Invalid MGRS string"
    }
}
