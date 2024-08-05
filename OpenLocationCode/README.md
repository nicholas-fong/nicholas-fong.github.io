The canonical openlocationcode.js at [Github-Google](https://github.com/google/open-location-code/tree/main/js) it is primarily used in complex mapping code.

For a stand alone minimalist application, a different approach is needed.

The goal is to convert openloactioncode.js to a library of simple functions such as `encode()` and `decode()`.

The canonical Python openlocationcode.py at [Github-Google](https://github.com/google/open-location-code/tree/main/python) consists of simple python functions. It seems to meet the goal. Using online code converter and OpenAI and CoPilot, the python library is transpile to JavaScript library.

The transpilation is not perfect, in the transpiled encode() function, immutable objects (e.g. latVal, lngVal) needed to be changed to mutable objects. This can be done simply by changing `const latVal` to `let latVal`. Also in the encode() function, the "Compute the grid part of the code if necessary" section needed to be manually adjusted to make sure no extraneous varibles are created as a byproduct of the Py-js conversion.

The modified version of openlocationcode.js contains 3 useful public functions:

`encode()` `decode()` `recoverNearest()`
