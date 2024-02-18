//parseMGRS.js
import Mgrs from './mgrs.js';

export function parseMGRS(mgrsString) {

    const clean_mgrs_string = mgrsString.toUpperCase().replace(/\s+/g, "");

    const LATLON = Mgrs.parse(clean_mgrs_string).toUtm().toLatLon();

    document.getElementById('response1').textContent = `${LATLON.lat.toFixed(6)},  ${LATLON.lon.toFixed(6)}` ;
    document.getElementById('response2').textContent = LATLON.toString();

    console.log(LATLON.lat.toFixed(6), LATLON.lon.toFixed(6));
    console.log(LATLON.toString());
    
}
  
