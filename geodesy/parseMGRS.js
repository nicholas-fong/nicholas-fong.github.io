//parseMGRS.js
import Mgrs from './mgrs.js';

export function parseMGRS(mgrsString) {

    const upper = mgrsString.toUpperCase();
    const nospace = upper.replace(/\s+/g, "");

    const mgrs = Mgrs.parse(nospace);
    const LATLON = mgrs.toUtm().toLatLon();

    console.log(LATLON.lat.toFixed(6), LATLON.lon.toFixed(6));
    console.log(LATLON.toString());
    
    document.getElementById('response1').textContent = `${LATLON.lat.toFixed(6)},   ${LATLON.lon.toFixed(6)}` ;
    document.getElementById('response2').textContent = LATLON.toString();
}
  
