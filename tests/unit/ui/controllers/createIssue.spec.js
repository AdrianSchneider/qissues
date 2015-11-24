'use strict';

var _            = require('underscore');
var expect       = require('chai').expect;
var nodemock     = require('nodemock');
var Promise      = require('bluebird');
var createIssue  = require('../../../../src/ui/controllers/createIssue');
var Expectations = require('../../../../src/domain/model/expectations');
var Cancellation = require('../../../../src/domain/errors/cancellation');
var NewIssue     = require('../../../../src/domain/model/newIssue');

describe('Create Issue Controller', function() {

  beforeEach(function() {
    this.ui            = nodemock.mock();
    this.ui.controller = nodemock.mock();
    this.repository    = nodemock.mock();
    this.normalizer    = nodemock.mock();
    this.logger        = nodemock.ignore('error');

    this.tracker = {
      getRepository: _.constant(this.repository),
      getNormalizer: _.constant(this.normalizer)
    };

    this.controller = createIssue(this.ui, this.tracker, this.logger);
  });

  afterEach(function() {
    this.ui.assertThrows();
    this.ui.controller.assertThrows();
    this.repository.assertThrows();
    this.normalizer.assertThrows();
  });

  it('Creates and persists a new issue from user input', function() {
    var filters = {};
    var input = { user: 'input' };
    var expectations = new Expectations({});
    var newIssue = new NewIssue('title', 'description');

    this.ui.mock('showLoading');

    this.normalizer
      .mock('getNewIssueRequirements')
      .returns(expectations);

    this.ui
      .mock('capture')
      .takes(expectations, filters)
      .returns(Promise.resolve(input));

    this.normalizer
      .mock('toNewIssue')
      .takes(input)
      .returns(newIssue);

    this.repository
      .mock('createIssue')
      .takes(newIssue)
      .returns(Promise.resolve('DEV-XXX'));

    this.ui.controller
      .mock('viewIssue')
      .takesF(function(id) {
        expect(id).to.equal('DEV-XXX');
        return true;
      })
      .returns(Promise.resolve());

    return this.controller(filters);
  });

  it('Catches Cancellations and then lists issues', function() {
    var filters = {};
    var input = { user: 'input' };
    var expectations = new Expectations({});
    var newIssue = new NewIssue('title', 'description');

    this.ui.mock('showLoading');

    this.normalizer
      .mock('getNewIssueRequirements')
      .returns(expectations);

    this.ui
      .mock('capture')
      .takes(expectations, filters)
      .returns(Promise.reject(new Cancellation()));

    this.ui
      .mock('message')
      .takes('Cancelled')
      .returns(Promise.resolve());

    this.ui.controller.mock('listIssues').takes(undefined);
    return this.controller(filters);
  });

  it('Catches errors and displays them in the ui', function() {
    var filters = {};
    var input = { user: 'input' };
    var expectations = new Expectations({});
    var newIssue = new NewIssue('title', 'description');

    this.ui.mock('showLoading');

    this.normalizer
      .mock('getNewIssueRequirements')
      .returns(expectations);

    this.ui
      .mock('capture')
      .takes(expectations, filters)
      .returns(Promise.reject(new Error('wat')));

    this.ui
      .mock('message')
      .takes('wat', 5000)
      .returns(Promise.resolve());

    this.ui.controller.mock('listIssues').takes(undefined);
    return this.controller(filters);
  });

});
