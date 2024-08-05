openlocationcode.js from Google-Github hard to get it to work.
A different approach, find openlocation.py and convert it to openlocation.js using online converter. 
https://www.codeconvert.ai/free-converter
The py code was stripped of large blocks of comments to fit under the 20,000 char limit of free-converter 
The converted openlocation.js has to be modified to get it to work:
inside the encode function (approximately line 161)
some of the immutable objects (e.g. latVal, lngVal, etc) have to be changed to mutable objects.
By changing 'const latVal' to 'let latVal' will achieve that goal.
This version of openlocationcode.js can be easily imported and the 10 functions become available to use.
