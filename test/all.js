beforeEach(function() {
    // reset uglify mangler to prevent changing var names
    require('uglify-js').base54.reset();
});
