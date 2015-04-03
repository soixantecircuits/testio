var ig = require('instagram-node').instagram(),
  fs = require('fs'),
  request = require('request'),
  Reminder = require('reminder'),
  remind = new Reminder(),
  mkdirp = require('mkdirp'),
  config = require('./config.json'),
  Repeat = require('repeat'),
  tagArray = ['animal','cool'];

// Every call to `ig.use()` overrides the `client_id/client_secret`
// or `access_token` previously entered if they exist.
//ig.use({ access_token: 'YOUR_ACCESS_TOKEN' });
ig.use({
  client_id: config.client_id,
  client_secret: config.client_secret
});

var destination = config.destinationPath + '/' + config.namespace + '/';

mkdirp(destination, function (err) {
  if(err){
    console.error(err);
  }else{
    console.log('pow!');
  }
});

var getRandom = function(arr){
  return arr[Math.floor(Math.random() * arr.length)]
}

var searchAndSave = function(tag) {
  ig.tag_media_recent(tag, function(err, medias, pagination, remaining, limit) {
    if (err) {
      console.log(err);
      return -1;
    }
    var medias = getRandom(medias);
    var image = medias.images.standard_resolution.url;
    console.log(image);

    var ws = fs.createWriteStream(destination + tag + '_' + Date.now() + '.jpg');
    ws.on('error', function (err) {
      console.log(err);
    });
    request(image).pipe(ws);
  });
}

function triggerSearchLoop(){
  var selectedTag = getRandom(tagArray);
  console.log('Searching tag:', selectedTag);
  Repeat(function(){
    searchAndSave(selectedTag);
  }).every(1, 's').for(59, 's').start.now();
}

remind.every('minute', function (date) {
  triggerSearchLoop();
});

triggerSearchLoop();
