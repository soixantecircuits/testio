var ig = require('instagram-node').instagram(),
  fs = require('fs'),
  request = require('request'),
  Reminder = require('reminder'),
  remind = new Reminder(),
  mkdirp = require('mkdirp'),
  config = require('./config.json'),
  Repeat = require('repeat'),
  tagArray = ['cow','cool','beauty','love'];
// Every call to `ig.use()` overrides the `client_id/client_secret`
// or `access_token` previously entered if they exist.
//ig.use({ access_token: 'YOUR_ACCESS_TOKEN' });
ig.use({
  client_id: config.client_id,
  client_secret: config.client_secret
});


    
mkdirp('./tmp/', function (err) {
    if (err) console.error(err)
    else console.log('pow!')
});

//ig.location_search({ lat: 48.565464564, lng: 2.34656589 }, [options,] function(err, result, remaining, limit) {});

var getRandom = function(arr){
  return arr[Math.floor(Math.random() * arr.length)]
}

var searchAndSave = function(tag) {
  ig.tag_media_recent(tag, function(err, medias, pagination, remaining, limit) {
    //ig.media_search(48.4335645654, 2.345645645, function(err, medias, remaining, limit) {
    if (err) {
      console.log(err);
      return -1;
    }
    var medias = getRandom(medias),
      image = medias.images.standard_resolution.url;
    console.log(image);

    var ws = fs.createWriteStream('./tmp/' + tag + '_' + Date.now() + '.jpg');
    ws.on('error', function(err) {
      console.log(err);
    });
    request(image).pipe(ws);
  });
}

remind.every('minute', function(date) {
    var selectedTag = getRandom(tagArray);
    console.log('Fetch: ', selectedTag);
    Repeat(function(){
      searchAndSave(selectedTag);      
    }).every(450, 'ms').for(32, 's').start.now();
});

searchAndSave('love');    
console.log('Running...');