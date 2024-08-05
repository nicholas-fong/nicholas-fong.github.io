For the published openlocationcode.js [Github-Google](https://github.com/google/open-location-code/tree/main/js) OpenLocationCode is an object. 
This is a different approach to convert the code such that OpenLocationCode.js consists of a collection of functions.
openlocation.py from https://github.com/google/open-location-code/tree/main/python is converted to javascript using an online converter https://www.codeconvert.ai/free-converter
Large blocks of comments in the python code is stripped off to fit under the 20,000 char limit of the free-converter. 
Further tweaking is needed:
Inside the encode() function, some of the immutable objects (e.g. latVal, lngVal, etc) needed to be changed to mutable objects.
For example, changing 'const latVal' to 'let latVal' will achieve that goal.
The modified version of openlocationcode.js can be imported and the 3 public functions become availabe.
encode() decode() recoverNearest()
