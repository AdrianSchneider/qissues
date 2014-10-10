var spawn = require('child_process').spawn;

module.exports = Create;

function Create(data, options, done) {
  var ps = spawn('qissues', ['create', '--strategy=stdin'], { cwd: options.cwd });
  var stdout = '';
  var stderr = '';

  ps.stdin.write(data, 'utf-8');
  ps.stdin.end();

  ps.stderr.on('data', function(data) {
    stderr += data.toString('utf-8');
  });
  ps.stdout.on('data', function(data) {
    stdout += data.toString('utf-8');
  });

  ps.on('close', function(code) {
    if(code) return done(new Error('Exited with code ' + code + ' -- ' +  stderr));
    return done(null, stdout);
  });
}
