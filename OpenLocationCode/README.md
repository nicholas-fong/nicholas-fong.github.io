openlocationcode.js from Github-Google is hard to get it to work.
Use a different approach. Download openlocation.py and convert it to openlocation.js, using an online converter. 
https://www.codeconvert.ai/free-converter
The downloaded python code was stripped out large blocks of comments to fit under the 20,000 char limit of the free-converter. 
The converted openlocation.js needs to be further modified to get it to work:
-inside the encode function (approximately line 161)
some of the immutable objects (e.g. latVal, lngVal, etc) need to be changed to mutable objects.
Replacing 'const latVal' to 'let latVal' will achieve that goal.
This version of openlocationcode.js can be simply imported, then the 10 functions become available for use.
