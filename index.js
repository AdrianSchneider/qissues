var blessed = require('blessed');
var program = blessed.program();
var screen  = blessed.screen();
var Qissues = require('./lib/qissues');

process.title = 'qissues';

var qissues = new Qissues(screen, {
    cwd: process.argv[2]
});

qissues.start();
