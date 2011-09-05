
all: $(patsubst %.ometajs,%.ometajs.js,$(shell find lib -name '*.ometajs'))

%.ometajs.js: %.ometajs
	ometajs2js -i $< -o $@

tests:
	./bin/borschik -t css -i tests/a.css -o tests/_a.css

.PHONY: all tests
