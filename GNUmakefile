
all: $(patsubst %.ometajs,%.ometajs.js,$(shell find lib -name '*.ometajs'))

%.ometajs.js: %.ometajs
	./node_modules/.bin/ometajs2js -b -i $< -o $@

tests:
	./bin/borschik -t css -i tests/a.css -o tests/_a.css

.PHONY: all tests
