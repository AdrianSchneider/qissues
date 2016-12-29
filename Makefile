PROJECT = "qissues"

default: ;@echo "Building ${PROJECT}"; \
	  bin/build;

test: test-unit

test-unit: ;@echo "Unit Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/unit/**/*.spec.ts"

test-domain: ;@echo "Domain Testing ${PROJECT}"; \
		node_modules/.bin/cucumber.js tests/domain --require tests/domain/support --require tests/domain/step_definitions -f progress;

test-ui: ;@echo "UI Testing ${PROJECT}"; \
		node_modules/.bin/cucumber.js tests/ui --require tests/ui/support --require tests/ui/step_definitions -f progress;

coverage: ;@echo "Making Coverage for ${PROJECT}"; \
		istanbul cover -x src/app/commands/index.js -x src/bootstrap.js --include-all-sources ./node_modules/mocha/bin/_mocha tests -- --recursive -R spec;

.PHONY: test test-domain test-unit test-ui coverage default
