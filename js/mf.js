
function parseString(str) {
  var struct = [];
  var ptr = 0;
  var newPtr = 0;
  var subVal = "";

  var i = 0;

  while(true) {
    newPtr = str.indexOf('{{', ptr);

    if (newPtr === -1) {
      subVal = str.substring(ptr);
      if (subVal || struct.length == 0) {
        struct.push({'type': 'String',
                     'value': subVal});
      }
      break;
    }

    struct.push({'type': 'String',
                 'value': str.substring(ptr, newPtr)});

    ptr = newPtr + 2;
    
    newPtr = str.indexOf('}}', ptr);

    struct.push({'type': 'Placeable',
                 'value': str.substring(ptr, newPtr)});

    ptr = newPtr + 2;
    if (i++ > 10) {
      break;
    }
  }
  return struct;
}

function parseValue(val) {
  if (typeof(val) == 'string') {
    return new MFString(val);
  }
  return new MFHash(val);
}

var MFString = function(str) {
  var val = parseString(str);

  return {
    type: 'MFString',
    toString: function(entry, index, mb, args) {
      var res = "";

      val.forEach(function(elem) {
        if (elem.type == 'String') {
          res += elem.value;
        }
        if (elem.type == 'Placeable') {
          res += mb.formatPlaceable(elem.value, entry, mb, args);
        }
      }.bind(this));

      return res;
    }
  };
}

var MFHash = function(hash) {
  var vals = {};
  
  for (var i in hash) {
    vals[i] = parseValue(hash[i]);
  }
  return {
    type: 'MFHash',
    toString: function(entry, index, mb, args) {
      var index0 = index[0];
      var entry = index0[0];

      if (mb.entries[entry] && mb.entries[entry].call) {
        var argKey = index0[1][0].substr(1);
        var param = mb.data[argKey];
        var key = mb.entries[entry].call(param);
      }
      index = index.slice(1);
      return vals[key].toString(entry, index, mb, args);
    }
  };
}

var Entry = function(obj, mb) {
  var _mb = mb;
  var _sourceVal = obj.value;
  var _id = obj.id;
  var _index = obj.index;
  var _val = null;

  _val = parseValue(_sourceVal);

  return {
    format: function(args) {
      if (_val.type == 'MFString') {
        return _val.toString(this, null, _mb, args);
      }

      if (_val.type == 'MFHash') {
        return _val.toString(this, _index, _mb, args);
      }
    }
  };
}

var Macro = function(obj, mb) {
  var _mb = mb;
  var _id = obj.id;
  var _body = obj.body;

  return {
    call: function(n) {
      return _body(n);
    },
  };
}

Intl.MessageBundle = function (locale) {
  var _code = locale;

  return {
    entries: {},
    data: {},
    get code() {
      return _code;
    },
    Entry: function(obj) {
      var entry = new Entry(obj, this);
      this.entries[obj.id] = entry;
      return entry;
    },
    Macro: function(obj) {
      var macro = new Macro(obj, this);
      this.entries[obj.id] = macro;
      return macro;
    },
    formatPlaceable: function(str, entry, bundle, args) {
      var data = {};
      
      for (var i in bundle.data) {
        data[i] = bundle.data[i];
      }

      if (args) {
        for (var i in args) {
          data[i] = args[i];
        }
      }

      if (str.startsWith('$')) {
        var key = str.substr(1);
        if (data[key]) {
          return data[key];
        }
      } else {
        if (bundle.entries[str]) {
          if (bundle.entries[str].format) {
            return bundle.entries[str].format(args);
          }
        }
      }

      return '{{'+str+'}}';
    },
  };
}
