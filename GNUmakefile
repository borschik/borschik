BIN = ./node_modules/.bin

test:
	$(BIN)/mocha

coverage: clean
	$(BIN)/istanbul instrument --output lib-cov --no-compact --variable global.__coverage__ lib
	-BORSCHIK_COVER=1 $(BIN)/mocha --reporter mocha-istanbul
	@echo
	@echo Open html-report/index.html file in your browser

clean:
	-rm -rf lib-cov
	-rm -rf html-report

.PHONY: test coverage clean
