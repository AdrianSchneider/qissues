module.exports = {
  seq: function(obj, keys, callback) {
    keys = cleanKeys(keys);
    if(typeof obj._onSequence === 'undefined') {
      obj._onSequence = onSequence;
    }


  }
};

function onSequence() {

}

function cleanKeys(keys) {
  if(!Array.isArray(keys)) {
    keys = keys.split('');
  }
  if(keys[0] === ',') keys = keys.slice(1);

  return keys;
}
