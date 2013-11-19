
var mb;
function main() {
  mb = new Intl.MessageBundle('pl');

  mb.data['name'] = 'John';
  mb.data['numPeople'] = 3;

  mb.Macro({
    'id': 'plural',
    'body': function(n) {
      return n==1?'one':'many';
    }
  });

  mb.Macro({
    'id': 'gender',
    'body': function(n) {
      return n=='John'?'male':'female';
    }
  });

  mb.Entry({
    'id': 'brandName',
    'value': 'Firefox',
  });
  var hello1 = mb.Entry({
    'id': 'hello1',
    'value': 'Hello world {{$name}}! And my name is {{brandName}}',
  });

  console.log(hello1.format());

  var hello2 = mb.Entry({
    'id': 'hello2',
    'index': [['plural', ['$numPeople']]],
    'value': {
      'one': 'Hello once',
      'many': 'Hello many times',
    }
  });

  console.log(hello2.format());
  var hello3 = mb.Entry({
    'id': 'hello3',
    'index': [['plural', ['$numPeople']]],
    'value': {
      'one': 'Hello once',
      'many': 'Hello many times {{$numPeople}} ',
    }
  });

  console.log(hello3.format());

  var hello4 = mb.Entry({
    'id': 'hello4',
    'index': [['plural', ['$numPeople']], ['gender', ['$name']]],
    'value': {
      'one': {},
      'many': {
        'male': 'Male: {{$name}} ',
        'female': 'Female',
      },
    }
  });

  console.log(hello4.format());

  // nested selection
  // placeables in selection

  // issues:

  // can't parse placeables like "foo {{ macro("}}") }}" - double parse
  // can't assign mb.entries['foo'] = {'id': 'foo', 'value': 'foo'}; - Entry

  // how the hell are we supposed to replace entry with its localization
  // if we don't know if it's registering or calling...
  //  - first time register, then call?
  //  - and if there's no resource loaded then it's always register+call?
  //  - but that means that old translation from resource will be used
  //  instead of the new one from the call...
  //
  //  so we should disallow mb.entries['dd'] = {};
  //
  //  how will we plug responsive l10n?
}
