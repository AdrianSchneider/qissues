'use strict';

var _                = require('underscore');
var expect           = require('chai').expect;
var nodemock         = require('nodemock');
var Promise          = require('bluebird');
var applyChangeSet   = require('../../../../src/ui/controllers/applyChangeSet');
var MoreInfoRequired = require('../../../../src/domain/errors/infoRequired');
var Expectations     = require('../../../../src/domain/model/expectations');

describe('Apply Changeset', function() {

  beforeEach(function() {
    this.ui = nodemock.mock();
    this.repository = nodemock.mock();
    this.tracker = { getRepository: _.constant(this.repository) };
    this.controller = applyChangeSet(this.ui, this.tracker);
  });

  beforeEach(function() {
    this.ui.assertThrows();
    this.repository.assertThrows();
  });

  it('Applies the changes at the repository', function() {
    var changes = { do: 'this' };
    this.repository
      .mock('apply')
      .takes(changes, {})
      .returns(Promise.resolve(true));

    return this.controller(changes);
  });

  it('Catches repository requests for more information, and tries again with more info', function() {
    var changes = { do: 'this' };
    var data = { user: 'input' };
    var expectations = new Expectations({});
    var moreInfo = new MoreInfoRequired('blah', expectations);

    this.repository
      .mock('apply')
      .takes(changes, {})
      .returns(Promise.reject(moreInfo));

    this.ui
      .mock('capture')
      .takes(expectations)
      .returns(Promise.resolve(data));

    this.repository
      .mock('apply')
      .takes(changes, data)
      .returns(Promise.resolve());


    return this.controller(changes);
  });

});
