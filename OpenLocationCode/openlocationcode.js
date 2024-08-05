// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Original contributors: https://github.com/google/open-location-code
// https://github.com/google/open-location-code/tree/main/python
// Python OLC code is converted to JavaScript using online code converter, and OpenAI
// the conversion is not perfect
// moderate manual debugging is needed, especially in the encode() function
// where immutable objects needed to be changed to mutable objects.
// some extraneous variables in encode() needed to be corrected.
// this modified JavaScript library consists of simple and useful functions:
// encode(), decode(), recoverNearest()

// A separator used to break the code into two parts to aid memorability.
const SEPARATOR_ = '+';

// The number of characters to place before the separator.
const SEPARATOR_POSITION_ = 8;

// The character used to pad codes.
const PADDING_CHARACTER_ = '0';

// The character set used to encode the values.
const CODE_ALPHABET_ = '23456789CFGHJMPQRVWX';

// The base to use to convert numbers to/from.
const ENCODING_BASE_ = CODE_ALPHABET_.length;

// The maximum value for latitude in degrees.
const LATITUDE_MAX_ = 90;

// The maximum value for longitude in degrees.
const LONGITUDE_MAX_ = 180;

// The max number of digits to process in a plus code.
const MAX_DIGIT_COUNT_ = 15;

// Maximum code length using lat/lng pair encoding. The area of such a
// code is approximately 13x13 meters (at the equator), and should be suitable
// for identifying buildings. This excludes prefix and separator characters.
const PAIR_CODE_LENGTH_ = 10;

// First place value of the pairs (if the last pair value is 1).
const PAIR_FIRST_PLACE_VALUE_ = Math.pow(ENCODING_BASE_, (PAIR_CODE_LENGTH_ / 2 - 1));

// Inverse of the precision of the pair section of the code.
const PAIR_PRECISION_ = Math.pow(ENCODING_BASE_, 3);

// The resolution values in degrees for each position in the lat/lng pair
// encoding. These give the place value of each position, and therefore the
// dimensions of the resulting area.
const PAIR_RESOLUTIONS_ = [20.0, 1.0, 0.05, 0.0025, 0.000125];

// Number of digits in the grid precision part of the code.
const GRID_CODE_LENGTH_ = MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_;

// Number of columns in the grid refinement method.
const GRID_COLUMNS_ = 4;

// Number of rows in the grid refinement method.
const GRID_ROWS_ = 5;

// First place value of the latitude grid (if the last place is 1).
const GRID_LAT_FIRST_PLACE_VALUE_ = Math.pow(GRID_ROWS_, (GRID_CODE_LENGTH_ - 1));

// First place value of the longitude grid (if the last place is 1).
const GRID_LNG_FIRST_PLACE_VALUE_ = Math.pow(GRID_COLUMNS_, (GRID_CODE_LENGTH_ - 1));

// Multiply latitude by this much to make it a multiple of the finest
// precision.
const FINAL_LAT_PRECISION_ = PAIR_PRECISION_ * Math.pow(GRID_ROWS_, (MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_));

// Multiply longitude by this much to make it a multiple of the finest
// precision.
const FINAL_LNG_PRECISION_ = PAIR_PRECISION_ * Math.pow(GRID_COLUMNS_, (MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_));

// Minimum length of a code that can be shortened.
const MIN_TRIMMABLE_CODE_LEN_ = 6;

const GRID_SIZE_DEGREES_ = 0.000125;

function isValid(code) {
    // The separator is required.
    let sep = code.indexOf(SEPARATOR_);
    const separatorRegex = new RegExp('\\' + SEPARATOR_, 'g'); // Escape the separator
    if ((code.match(separatorRegex) || []).length > 1) {
        return false;
    }
    // Is it the only character?
    if (code.length === 1) {
        return false;
    }
    // Is it in an illegal position?
    if (sep === -1 || sep > SEPARATOR_POSITION_ || sep % 2 === 1) {
        return false;
    }
    // We can have an even number of padding characters before the separator,
    // but then it must be the final character.
    const pad = code.indexOf(PADDING_CHARACTER_);
    if (pad !== -1) {
        // Short codes cannot have padding
        if (sep < SEPARATOR_POSITION_) {
            return false;
        }
        // Not allowed to start with them!
        if (pad === 0) {
            return false;
        }

        // There can only be one group and it must have even length.
        const rpad = code.lastIndexOf(PADDING_CHARACTER_) + 1;
        const pads = code.substring(pad, rpad);
        const paddingRegex = new RegExp('\\' + PADDING_CHARACTER_, 'g'); // Escape the padding character
        if (pads.length % 2 === 1 || (pads.match(paddingRegex) || []).length !== pads.length) {
            return false;
        }
        // If the code is long enough to end with a separator, make sure it does.
        if (!code.endsWith(SEPARATOR_)) {
            return false;
        }
    }
    // one of them (not legal).
    if (code.length - sep - 1 === 1) {
        return false;
    }
    // Check the code contains only valid characters.
    const sepPad = SEPARATOR_ + PADDING_CHARACTER_;
    for (const ch of code) {
        if (!CODE_ALPHABET_.includes(ch.toUpperCase()) && !sepPad.includes(ch)) {
            return false;
        }
    }
    return true;
}

function isShort(code) {
    // Check it's valid.
    if (!isValid(code)) {
        return false;
    }
    // If there are less characters than expected before the SEPARATOR.
    let sep = code.indexOf(SEPARATOR_);
    if (sep >= 0 && sep < SEPARATOR_POSITION_) {
        return true;
    }
    return false;
}

function isFull(code) {
    if (!isValid(code)) {
        return false;
    }
    // If it's short, it's not full
    if (isShort(code)) {
        return false;
    }
    // Work out what the first latitude character indicates for latitude.
    const firstLatValue = CODE_ALPHABET_.indexOf(code[0].toUpperCase()) * ENCODING_BASE_;
    if (firstLatValue >= LATITUDE_MAX_ * 2) {
        // The code would decode to a latitude of >= 90 degrees.
        return false;
    }
    if (code.length > 1) {
        // Work out what the first longitude character indicates for longitude.
        const firstLngValue = CODE_ALPHABET_.indexOf(code[1].toUpperCase()) * ENCODING_BASE_;
        if (firstLngValue >= LONGITUDE_MAX_ * 2) {
            // The code would decode to a longitude of >= 180 degrees.
            return false;
        }
    }
    return true;
}

//   Encode a location, default accuracy:
//   encode(47.365590, 8.524997)

//   Encode a location using one stage of additional refinement:
//   encode(47.365590, 8.524997, 11)

//# Codes represent rectangular areas rather than points, and the longer the
//# code, the smaller the area. A 10 character code represents a 13.5x13.5
//# meter area (at the equator. A 11 character code represents approximately
//# a 2.8x3.5 meter area. A 12 character code represents 0.35x0.35 meter area.

function encode(latitude, longitude, codeLength = PAIR_CODE_LENGTH_) {
    if (codeLength < 2 || (codeLength < PAIR_CODE_LENGTH_ && codeLength % 2 === 1)) {
        throw new Error('Invalid Open Location Code length - ' + codeLength);
    }

    codeLength = Math.min(codeLength, MAX_DIGIT_COUNT_);
    // Ensure that latitude and longitude are valid.
    latitude = clipLatitude(latitude);
    longitude = normalizeLongitude(longitude);

    // Latitude 90 needs to be adjusted to be just less, so the returned code
    if (latitude === 90) {
        latitude = latitude - computeLatitudePrecision(codeLength);
    }
    let code = '';

    let latVal = Math.round((latitude + LATITUDE_MAX_) * FINAL_LAT_PRECISION_);
    let lngVal = Math.round((longitude + LONGITUDE_MAX_) * FINAL_LNG_PRECISION_);

    // Compute the grid part of the code if necessary.
    if (codeLength > PAIR_CODE_LENGTH_) {
        for (let i = 0; i < MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_; i++) {
            let latDigit = latVal % GRID_ROWS_;
            let lngDigit = lngVal % GRID_COLUMNS_;
            let ndx = latDigit * GRID_COLUMNS_ + lngDigit;
            code = CODE_ALPHABET_[ndx] + code;
            latVal = Math.floor(latVal / GRID_ROWS_);
            lngVal = Math.floor(lngVal / GRID_COLUMNS_);
        }
    } else {
        latVal = Math.floor(latVal / Math.pow(GRID_ROWS_, GRID_CODE_LENGTH_));
        lngVal = Math.floor(lngVal / Math.pow(GRID_COLUMNS_, GRID_CODE_LENGTH_));
    }

    // Compute the pair section of the code.
    for (let i = 0; i < PAIR_CODE_LENGTH_ / 2; i++) {
        code = CODE_ALPHABET_[lngVal % ENCODING_BASE_] + code;
        code = CODE_ALPHABET_[latVal % ENCODING_BASE_] + code;
        latVal = Math.floor(latVal / ENCODING_BASE_);
        lngVal = Math.floor(lngVal / ENCODING_BASE_);
    }

    // Add the separator character.
    code = code.substring(0, SEPARATOR_POSITION_) + SEPARATOR_ + code.substring(SEPARATOR_POSITION_);
    
    // If we don't need to pad the code, return the requested section.
    if (codeLength >= SEPARATOR_POSITION_) {
        return code.substring(0, codeLength + 1);
    }

    // Pad and return the code.
    return code.substring(0, codeLength) + '0'.repeat(SEPARATOR_POSITION_ - codeLength) + SEPARATOR_;
}

//   Decode a full code to GPS coordinates. 
//   code = "84XV62QM+QJ"
//   codeArea = decode(code)
//   let [latitude, longitude] = CodeArea.latlng();
//   let result = latitude.toFixed(5) + ', ' + longitude.toFixed(5);

function decode(code) {
    if (!isFull(code)) {
        throw new Error('Passed Open Location Code is not a valid full code - ' + code);
    }
    code = code.replace(/[+0]/g, '').toUpperCase();
    code = code.substring(0, MAX_DIGIT_COUNT_);
    // Initialise the values for each section. We work them out as integers and
    // convert them to floats at the end.
    let normalLat = -LATITUDE_MAX_ * PAIR_PRECISION_;
    let normalLng = -LONGITUDE_MAX_ * PAIR_PRECISION_;
    let gridLat = 0;
    let gridLng = 0;
    // How many digits do we have to process?
    let digits = Math.min(code.length, PAIR_CODE_LENGTH_);
    // Define the place value for the most significant pair.
    let pv = PAIR_FIRST_PLACE_VALUE_;
    // Decode the most significant paired digits.
    for (let i = 0; i < digits; i += 2) {
        normalLat += CODE_ALPHABET_.indexOf(code[i]) * pv;
        normalLng += CODE_ALPHABET_.indexOf(code[i + 1]) * pv;
        if (i < digits - 2) {
            pv = Math.floor(pv / ENCODING_BASE_);
        }
    }

    // Convert the place value to a float in degrees.
    let latPrecision = pv / PAIR_PRECISION_;
    let lngPrecision = pv / PAIR_PRECISION_;
    // Process any extra precision digits.
    if (code.length > PAIR_CODE_LENGTH_) {
        // Initialise the place values for the grid.
        let rowpv = GRID_LAT_FIRST_PLACE_VALUE_;
        let colpv = GRID_LNG_FIRST_PLACE_VALUE_;
        // How many digits do we have to process?
        digits = Math.min(code.length, MAX_DIGIT_COUNT_);
        for (let i = PAIR_CODE_LENGTH_; i < digits; i++) {
            const digitVal = CODE_ALPHABET_.indexOf(code[i]);
            const row = Math.floor(digitVal / GRID_COLUMNS_);
            const col = digitVal % GRID_COLUMNS_;
            gridLat += row * rowpv;
            gridLng += col * colpv;
            if (i < digits - 1) {
                rowpv = Math.floor(rowpv / GRID_ROWS_);
                colpv = Math.floor(colpv / GRID_COLUMNS_);
            }
        }

        // Adjust the precisions from the integer values to degrees.
        latPrecision = rowpv / FINAL_LAT_PRECISION_;
        lngPrecision = colpv / FINAL_LNG_PRECISION_;
    }

    // Merge the values from the normal and extra precision parts of the code.
    let lat = normalLat / PAIR_PRECISION_ + gridLat / FINAL_LAT_PRECISION_;
    let lng = normalLng / PAIR_PRECISION_ + gridLng / FINAL_LNG_PRECISION_;
    // Multiple values by 1e14, round and then divide. This reduces errors due
    // to floating point precision.
    return new CodeArea(
        Math.round(lat * 1e14) / 1e14,
        Math.round(lng * 1e14) / 1e14,
        Math.round((lat + latPrecision) * 1e14) / 1e14,
        Math.round((lng + lngPrecision) * 1e14) / 1e14,
        Math.min(code.length, MAX_DIGIT_COUNT_)
    );
}

//#   Recover the full code from a short code:
//#   recoverNearest('9G8F+6X', 47.4, 8.6)
//#   recoverNearest('8F+6X', 47.4, 8.6)

function recoverNearest(code, referenceLatitude, referenceLongitude) {
    // if code is a valid full code, return it properly capitalized
    if (isFull(code)) {
        return code.toUpperCase();
    }
    if (!isShort(code)) {
        throw new Error('Passed short code is not valid - ' + code);
    }
    // Ensure that latitude and longitude are valid.
    referenceLatitude = clipLatitude(referenceLatitude);
    referenceLongitude = normalizeLongitude(referenceLongitude);
    // Clean up the code passed as parmeter.
    code = code.toUpperCase();
    // Compute the number of digits we need to recover.
    let paddingLength = SEPARATOR_POSITION_ - code.indexOf(SEPARATOR_);
    // The resolution (height and width) of the padded area in degrees.
    let resolution = Math.pow(20, 2 - (paddingLength / 2));
    // Distance from the center to an edge (in degrees).
    let halfResolution = resolution / 2.0;
    // Use the reference location to pad the supplied short code and decode it.
    let codeArea = decode(encode(referenceLatitude, referenceLongitude).substring(0, paddingLength) + code);

    // How many degrees latitude is the code from the reference? If it is more
    // than half the resolution, we need to move it north or south but keep it
    // within -90 to 90 degrees.
    if (referenceLatitude + halfResolution < codeArea.latitudeCenter && codeArea.latitudeCenter - resolution >= -LATITUDE_MAX_) {
        // If the proposed code is more than half a cell north of the reference location,
        // it's too far, and the best match will be one cell south.
        codeArea.latitudeCenter -= resolution;
    } else if (referenceLatitude - halfResolution > codeArea.latitudeCenter && codeArea.latitudeCenter + resolution <= LATITUDE_MAX_) {
        // If the proposed code is more than half a cell south of the reference location,
        // it's too far, and the best match will be one cell north.
        codeArea.latitudeCenter += resolution;
    }
    // Adjust longitude if necessary.
    if (referenceLongitude + halfResolution < codeArea.longitudeCenter) {
        codeArea.longitudeCenter -= resolution;
    } else if (referenceLongitude - halfResolution > codeArea.longitudeCenter) {
        codeArea.longitudeCenter += resolution;
    }
    return encode(codeArea.latitudeCenter, codeArea.longitudeCenter, codeArea.codeLength);
}

function shorten(code, latitude, longitude) {
    if (!isFull(code)) {
        throw new Error('Passed code is not valid and full: ' + code);
    }
    if (code.indexOf(PADDING_CHARACTER_) !== -1) {
        throw new Error('Cannot shorten padded codes: ' + code);
    }
    code = code.toUpperCase();
    const codeArea = decode(code);
    if (codeArea.codeLength < MIN_TRIMMABLE_CODE_LEN_) {
        throw new Error('Code length must be at least ' + MIN_TRIMMABLE_CODE_LEN_);
    }
    // Ensure that latitude and longitude are valid.
    latitude = clipLatitude(latitude);
    longitude = normalizeLongitude(longitude);
    // How close are the latitude and longitude to the code center.
    const coderange = Math.max(Math.abs(codeArea.latitudeCenter - latitude), Math.abs(codeArea.longitudeCenter - longitude));
    for (let i = PAIR_RESOLUTIONS_.length - 2; i > 0; i--) {
        // Check if we're close enough to shorten. The range must be less than 1/2
        // the resolution to shorten at all, and we want to allow some safety, so
        // use 0.3 instead of 0.5 as a multiplier.
        if (coderange < (PAIR_RESOLUTIONS_[i] * 0.3)) {
            // Trim it.
            return code.substring((i + 1) * 2);
        }
    }
    return code;
}

function clipLatitude(latitude) {
    return Math.min(90, Math.max(-90, latitude));
}

function computeLatitudePrecision(codeLength) {
    if (codeLength <= 10) {
        return Math.pow(20, Math.floor((codeLength / -2) + 2));
    }
    return Math.pow(20, -3) / Math.pow(GRID_ROWS_, codeLength - 10);
}

function normalizeLongitude(longitude) {
    while (longitude < -180) {
        longitude += 360;
    }
    while (longitude >= 180) {
        longitude -= 360;
    }
    return longitude;
}

class CodeArea {
    constructor(latitudeLo, longitudeLo, latitudeHi, longitudeHi, codeLength) {
        this.latitudeLo = latitudeLo;
        this.longitudeLo = longitudeLo;
        this.latitudeHi = latitudeHi;
        this.longitudeHi = longitudeHi;
        this.codeLength = codeLength;
        this.latitudeCenter = Math.min(latitudeLo + (latitudeHi - latitudeLo) / 2, LATITUDE_MAX_);
        this.longitudeCenter = Math.min(longitudeLo + (longitudeHi - longitudeLo) / 2, LONGITUDE_MAX_);
    }

    toString() {
        return JSON.stringify([
            this.latitudeLo, this.longitudeLo, this.latitudeHi,
            this.longitudeHi, this.latitudeCenter, this.longitudeCenter,
            this.codeLength
        ]);
    }

    latlng() {
        return [this.latitudeCenter, this.longitudeCenter];
    }
}


