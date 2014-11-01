var spotify = require('spotify-node-applescript');
var fs = require('fs');

songs = [];
args = process.argv.splice(2);
filepath = args[args.indexOf("-f") + 1];
count = args[args.indexOf("-c") + 1];

save_songs(count, 0, songs, filepath);
function save_songs(count, counter, songs, filepath) {
  if(counter < count){
    spotify.getTrack(function(err, track){
      if(typeof track !== 'undefined') {
        songs.push(track["spotify_url"]);
        spotify.next(function(){
          save_songs(count, counter + 1, songs, filepath);
        });
      } else {
        console.log('Spotify radio stopped.');
        console.log(counter + ' songs were scraped.');
        prune_duplicates(songs, filepath);
      }
    });
  } else {
    console.log(counter + ' songs were scraped.');
    prune_duplicates(songs, filepath);
  }
}

function prune_duplicates(songs, filepath){
  array = current_list(filepath, []);
  array = remove_duplicates(array.concat(songs));
  write_songs(array, filepath);
}

function remove_duplicates(array) {
  array = array.filter(function(elem, pos) {
    return array.indexOf(elem) == pos;
  });
  return array;
}

function current_list(filepath, array) {
  fs.stat(filepath, function(err, stat) {
    if(err == null) {
      console.log('Appending to file: ', filepath);
      array = fs.readFileSync(filepath).toString().split("\n");
    } else if(err.code == 'ENOENT') {
      console.log('Creating file', filepath);
    } else {
      console.log('An unexpected error occurred: ', err.code);
    }
    fs.writeFile(filepath, '');
  });
  return array;
}

function write_songs(array, filepath) {
  for(i in array){
    fs.appendFile(filepath, array[i] + '\n', function (err,data) {
      if (err) { return console.log(err); }
    });
  }
}
