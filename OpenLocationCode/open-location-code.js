// https://github.com/google/open-location-code/
// python library
// https://github.com/google/open-location-code/blob/main/python/openlocationcode/openlocationcode.py
// translated to JavaScript

/* #  -*- coding: utf-8 -*-
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
#
#
# Convert locations to and from short codes.
#
# Open Location Codes are short, 10-11 character codes that can be used instead
# of street addresses. The codes can be generated and decoded offline, and use
# a reduced character set that minimises the chance of codes including words.
#
# Codes are able to be shortened relative to a nearby location. This means that
# in many cases, only four to seven characters of the code are needed.
# To recover the original code, the same location is not required, as long as
# a nearby location is provided.
#
# Codes represent rectangular areas rather than points, and the longer the
# code, the smaller the area. A 10 character code represents a 13.5x13.5
# meter area (at the equator. An 11 character code represents approximately
# a 2.8x3.5 meter area.
#
# Two encoding algorithms are used. The first 10 characters are pairs of
# characters, one for latitude and one for longitude, using base 20. Each pair
# reduces the area of the code by a factor of 400. Only even code lengths are
# sensible, since an odd-numbered length would have sides in a ratio of 20:1.
#
# At position 11, the algorithm changes so that each character selects one
# position from a 4x5 grid. This allows single-character refinements.
#
# Examples:
#
#   Encode a location, default accuracy:
#   encode(47.365590, 8.524997)
#
#   Encode a location using one stage of additional refinement:
#   encode(47.365590, 8.524997, 11)
#
#   Decode a full code:
#   coord = decode(code)
#   msg = "Center is {lat}, {lon}".format(lat=coord.latitudeCenter, lon=coord.longitudeCenter)
#
#   Attempt to trim the first characters from a code:
#   shorten('8FVC9G8F+6X', 47.5, 8.5)
#
#   Recover the full code from a short code:
#   recoverNearest('9G8F+6X', 47.4, 8.6)
#   recoverNearest('8F+6X', 47.4, 8.6)
*/

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
    /**
     * Determines if a code is valid.
     * To be valid, all characters must be from the Open Location Code character
     * set with at most one separator. The separator can be in any even-numbered
     * position up to the eighth digit.
     */
    const sep = code.indexOf(SEPARATOR_);
    
    // The separator is required.
    if (code.split(SEPARATOR_).length - 1 > 1) {
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
        if (pads.length % 2 === 1 || pads.split(PADDING_CHARACTER_).length - 1 !== pads.length) {
            return false;
        }
        // If the code is long enough to end with a separator, make sure it does.
        if (!code.endsWith(SEPARATOR_)) {
            return false;
        }
    }
    // If there are characters after the separator, make sure there isn't just
    // one of them (not legal).
    if (code.length - sep - 1 === 1) {
        return false;
    }
    // Check the code contains only valid characters.
    const sepPad = SEPARATOR_ + PADDING_CHARACTER_;
    for (let ch of code) {
        if (!CODE_ALPHABET_.includes(ch.toUpperCase()) && !sepPad.includes(ch)) {
            return false;
        }
    }
    return true;
}

function isShort(code) {
    /**
     * Determines if a code is a valid short code.
     * A short Open Location Code is a sequence created by removing four or more
     * digits from an Open Location Code. It must include a separator
     * character.
     */
    // Check it's valid.
    if (!isValid(code)) {
        return false;
    }
    // If there are fewer characters than expected before the SEPARATOR.
    const sep = code.indexOf(SEPARATOR_);
    if (sep >= 0 && sep < SEPARATOR_POSITION_) {
        return true;
    }
    return false;
}

function isFull(code) {
    /**
     * Determines if a code is a valid full Open Location Code.
     * Not all possible combinations of Open Location Code characters decode to
     * valid latitude and longitude values. This checks that a code is valid
     * and also that the latitude and longitude values are legal. If the prefix
     * character is present, it must be the first character. If the separator
     * character is present, it must be after four characters.
     */
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

function encode(latitude, longitude, codeLength = PAIR_CODE_LENGTH_) {
    /**
     * Encode a location into an Open Location Code.
     * Produces a code of the specified length, or the default length if no length
     * is provided.
     * The length determines the accuracy of the code. The default length is
     * 10 characters, returning a code of approximately 13.5x13.5 meters. Longer
     * codes represent smaller areas, but lengths > 14 are sub-centimetre and so
     * 11 or 12 are probably the limit of useful codes.
     * Args:
     *   latitude: A latitude in signed decimal degrees. Will be clipped to the
     *       range -90 to 90.
     *   longitude: A longitude in signed decimal degrees. Will be normalised to
     *       the range -180 to 180.
     *   codeLength: The number of significant digits in the output code, not
     *       including any separator characters.
     */
    
    if (codeLength < 2 || (codeLength < PAIR_CODE_LENGTH_ && codeLength % 2 === 1)) {
        throw new Error('Invalid Open Location Code length - ' + String(codeLength));
    }
    
    codeLength = Math.min(codeLength, MAX_DIGIT_COUNT_);
    
    // Ensure that latitude and longitude are valid.
    latitude = clipLatitude(latitude);
    longitude = normalizeLongitude(longitude);
    
    // Latitude 90 needs to be adjusted to be just less, so the returned code
    // can also be decoded.
    if (latitude === 90) {
        latitude = latitude - computeLatitudePrecision(codeLength);
    }
    
    let code = '';

    // Multiply values by their precision and convert to positive.
    // Force to integers so the division operations will have integer results.
    let latVal = Math.round((latitude + LATITUDE_MAX_) * FINAL_LAT_PRECISION_);
    let lngVal = Math.round((longitude + LONGITUDE_MAX_) * FINAL_LNG_PRECISION_);

    // Compute the grid part of the code if necessary.
    if (codeLength > PAIR_CODE_LENGTH_) {
        for (let i = 0; i < MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_; i++) {
            const latDigit = latVal % GRID_ROWS_;
            const lngDigit = lngVal % GRID_COLUMNS_;
            const ndx = latDigit * GRID_COLUMNS_ + lngDigit;
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
    code = code.slice(0, SEPARATOR_POSITION_) + SEPARATOR_ + code.slice(SEPARATOR_POSITION_);

    // If we don't need to pad the code, return the requested section.
    if (codeLength >= SEPARATOR_POSITION_) {
        return code.slice(0, codeLength + 1);
    }

    // Pad and return the code.
    return code.slice(0, codeLength).padEnd(SEPARATOR_POSITION_, '0') + SEPARATOR_;
}

function decode(code) {
    /**
     * Decodes an Open Location Code into the location coordinates.
     * Returns an object that includes the coordinates of the bounding
     * box - the lower left, center, and upper right.
     * Args:
     *   code: The Open Location Code to decode.
     * Returns:
     *   A CodeArea object that provides the latitude and longitude of two of the
     *   corners of the area, the center, and the length of the original code.
     */
    
    if (!isFull(code)) {
        throw new Error('Passed Open Location Code is not a valid full code - ' + String(code));
    }
    
    // Strip out separator and padding characters. Convert to upper case and constrain to max digits.
    code = code.replace(/[+0]/g, '');
    code = code.toUpperCase();
    code = code.slice(0, MAX_DIGIT_COUNT_);

    // Initialize the values for each section.
    let normalLat = -LATITUDE_MAX_ * PAIR_PRECISION_;
    let normalLng = -LONGITUDE_MAX_ * PAIR_PRECISION_;
    let gridLat = 0;
    let gridLng = 0;

    // How many digits do we have to process?
    let digits = Math.min(code.length, PAIR_CODE_LENGTH_);

    // Define the place value for the most significant pair.
    let pv = PAIR_FIRST_PLACE_VALUE_;

    // Decode the paired digits.
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
        // Initialize the place values for the grid.
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
    const lat = normalLat / PAIR_PRECISION_ + gridLat / FINAL_LAT_PRECISION_;
    const lng = normalLng / PAIR_PRECISION_ + gridLng / FINAL_LNG_PRECISION_;

    // Multiple values by 1e14, round, and then divide to reduce floating-point precision errors.
    return new CodeArea(
        Math.round(lat * 1e14) / 1e14,
        Math.round(lng * 1e14) / 1e14,
        Math.round((lat + latPrecision) * 1e14) / 1e14,
        Math.round((lng + lngPrecision) * 1e14) / 1e14,
        Math.min(code.length, MAX_DIGIT_COUNT_)
    );
}

function recoverNearest(code, referenceLatitude, referenceLongitude) {
    /**
     * Recover the nearest matching code to a specified location.
     * Given a short code of between four and seven characters, this recovers
     * the nearest matching full code to the specified location.
     * Args:
     *   code: A valid OLC character sequence.
     *   referenceLatitude: The latitude (in signed decimal degrees) to use to
     *       find the nearest matching full code.
     *   referenceLongitude: The longitude (in signed decimal degrees) to use
     *       to find the nearest matching full code.
     * Returns:
     *   The nearest full Open Location Code to the reference location that matches
     *   the short code. If the passed code was not a valid short code, but was a
     *   valid full code, it is returned with proper capitalization but otherwise
     *   unchanged.
     */
    
    // If code is a valid full code, return it properly capitalized.
    if (isFull(code)) {
        return code.toUpperCase();
    }
    
    if (!isShort(code)) {
        throw new Error('Passed short code is not valid - ' + String(code));
    }

    // Ensure that latitude and longitude are valid.
    referenceLatitude = clipLatitude(referenceLatitude);
    referenceLongitude = normalizeLongitude(referenceLongitude);

    // Clean up the passed code.
    code = code.toUpperCase();

    // Compute the number of digits we need to recover.
    const paddingLength = SEPARATOR_POSITION_ - code.indexOf(SEPARATOR_);

    // The resolution (height and width) of the padded area in degrees.
    const resolution = Math.pow(20, 2 - (paddingLength / 2));

    // Distance from the center to an edge (in degrees).
    const halfResolution = resolution / 2.0;

    // Use the reference location to pad the supplied short code and decode it.
    const codeArea = decode(encode(referenceLatitude, referenceLongitude).slice(0, paddingLength) + code);

    // Adjust latitude if necessary.
    if (referenceLatitude + halfResolution < codeArea.latitudeCenter &&
        codeArea.latitudeCenter - resolution >= -LATITUDE_MAX_) {
        // Move the code one cell south.
        codeArea.latitudeCenter -= resolution;
    } else if (referenceLatitude - halfResolution > codeArea.latitudeCenter &&
               codeArea.latitudeCenter + resolution <= LATITUDE_MAX_) {
        // Move the code one cell north.
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
    /**
     * Remove characters from the start of an OLC code.
     * This uses a reference location to determine how many initial characters
     * can be removed from the OLC code. The number of characters that can be
     * removed depends on the distance between the code center and the reference
     * location.
     * The minimum number of characters that will be removed is four. If more than
     * four characters can be removed, the additional characters will be replaced
     * with the padding character. At most eight characters will be removed.
     * The reference location must be within 50% of the maximum range. This ensures
     * that the shortened code will be able to be recovered using slightly different
     * locations.
     * Args:
     *   code: A full, valid code to shorten.
     *   latitude: A latitude, in signed decimal degrees, to use as the reference
     *       point.
     *   longitude: A longitude, in signed decimal degrees, to use as the reference
     *       point.
     * Returns:
     *   Either the original code, if the reference location was not close enough,
     *   or the shortened code.
     */

    if (!isFull(code)) {
        throw new Error('Passed code is not valid and full: ' + String(code));
    }
    if (code.includes(PADDING_CHARACTER_)) {
        throw new Error('Cannot shorten padded codes: ' + String(code));
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
    const coderange = Math.max(
        Math.abs(codeArea.latitudeCenter - latitude),
        Math.abs(codeArea.longitudeCenter - longitude)
    );

    for (let i = PAIR_RESOLUTIONS_.length - 2; i > 0; i--) {
        // Check if we're close enough to shorten. The range must be less than 1/2
        // the resolution to shorten at all, and we want to allow some safety, so
        // use 0.3 instead of 0.5 as a multiplier.
        if (coderange < (PAIR_RESOLUTIONS_[i] * 0.3)) {
            // Trim it.
            return code.slice((i + 1) * 2);
        }
    }

    return code;
}

function clipLatitude(latitude) {
    /**
     * Clip a latitude into the range -90 to 90.
     * @param {number} latitude - A latitude in signed decimal degrees.
     * @returns {number} - The clipped latitude.
     */
    return Math.min(90, Math.max(-90, latitude));
}

function computeLatitudePrecision(codeLength) {
    /**
     * Compute the latitude precision value for a given code length. Lengths <=
     * 10 have the same precision for latitude and longitude, but lengths > 10
     * have different precisions due to the grid method having fewer columns than
     * rows.
     * @param {number} codeLength - The length of the OLC code.
     * @returns {number} - The latitude precision.
     */
    if (codeLength <= 10) {
        return Math.pow(20, Math.floor((codeLength / -2) + 2));
    }
    return Math.pow(20, -3) / Math.pow(GRID_ROWS_, codeLength - 10);
}

function normalizeLongitude(longitude) {
    /**
     * Normalize a longitude into the range -180 to 180, not including 180.
     * @param {number} longitude - A longitude in signed decimal degrees.
     * @returns {number} - The normalized longitude.
     */
    while (longitude < -180) {
        longitude += 360;
    }
    while (longitude >= 180) {
        longitude -= 360;
    }
    return longitude;
}



//
class CodeArea {
    /**
     * Coordinates of a decoded Open Location Code.
     * The coordinates include the latitude and longitude of the lower left and
     * upper right corners and the center of the bounding box for the area the
     * code represents.
     * Attributes:
     *   latitudeLo: The latitude of the SW corner in degrees.
     *   longitudeLo: The longitude of the SW corner in degrees.
     *   latitudeHi: The latitude of the NE corner in degrees.
     *   longitudeHi: The longitude of the NE corner in degrees.
     *   latitudeCenter: The latitude of the center in degrees.
     *   longitudeCenter: The longitude of the center in degrees.
     *   codeLength: The number of significant characters that were in the code.
     *       This excludes the separator.
     */
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
        return `[${this.latitudeLo}, ${this.longitudeLo}, ${this.latitudeHi}, ${this.longitudeHi}, ${this.latitudeCenter}, ${this.longitudeCenter}, ${this.codeLength}]`;
    }

    latlng() {
        return [this.latitudeCenter, this.longitudeCenter];
    }
}

