/* borschik:include:js/file1.js */

var foo = 'wat?!';

/* borschik:include:js/file3.js */

var string = "borschik:include:js/file1.txt";

var obj = {/* borschik:include:js/file1.json */};
var arr = [/* borschik:include:js/file2.json */];

// comment1
var a = "//";/* borschik:include:js/file2.js */
// comment2

var n = borschik.link('./include1.js');
