var spawn = require('child_process').spawn;

module.exports = CreateTemplate;

function CreateTemplate(options, done) {
  var p = spawn('qissues', ['create', '--template'], { cwd: options.cwd });
  var stdout = '';
  var stderr = '';

  p.stderr.on('data', function(data) {
    stderr += data.toString('utf-8');
  });
  p.stdout.on('data', function(data) {
    stdout += data.toString('utf-8');
  });

  p.on('close', function(code) {
    if(code) return done(new Error('Exited with code ' + code + ' -- ' +  stderr));
    return done(null, stdout);
  });
}
