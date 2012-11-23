BIN = ./node_modules/.bin

.PHONY: all tests test

all: $(patsubst %.ometajs,%.ometajs.js,$(shell find lib -name '*.ometajs'))

%.ometajs.js: %.ometajs
	$(BIN)/ometajs2js -b -i $< -o $@

tests:
	./bin/borschik -t css -i tests/a.css -o tests/_a.css

test:
	node_modules/.bin/mocha

lib-cov: clean-coverage
	$(BIN)/istanbul instrument --output lib-cov --no-compact --variable global.__coverage__ lib

.PHONY: coverage
coverage: lib-cov
	BORSCHIK_COVER=1 $(BIN)/mocha --reporter mocha-istanbul
	@echo
	@echo Open html-report/index.html file in your browser

.PHONY: clean
	clean: clean-coverage

.PHONY: clean-coverage
clean-coverage:
	-rm -rf lib-cov
	-rm -rf html-report
