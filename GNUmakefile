BIN = ./node_modules/.bin

.PHONY: test

test:
	$(BIN)/mocha

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
