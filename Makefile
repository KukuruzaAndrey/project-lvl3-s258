install: install-deps
develop:
	npm run webpack-serve

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npm run webpack
	cp CNAME dist

test:
	npm test

lint:
	npm run eslint .

publish:
	surge

.PHONY: test
