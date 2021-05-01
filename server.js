const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fetch = require("node-fetch");

const api_key = '59dfba860b7c84402018a22f1ec7aa9a';
const langage = 'fr'
const search_url = 'https://api.themoviedb.org/3/search/movie?api_key='
const img_url = 'https://image.tmdb.org/t/p/w500'

const path = require('path');
const srt2vtt = require('srt-to-vtt');
const fs = require('fs');

const port = process.env.PORT || 5000;
const pug = require('pug');
const e = require('express');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(bodyParser.json())

// get movies in media dir

var files=fs.readdirSync('public/media');

for(var i=0;i<files.length;i++){
    var filename=files[i];
    if (filename.split('.mp4')[1] != undefined) {
        var name = filename.split('.mp4')[0];
        searchByName(name);
    };
};
var aMovies = [];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  // authorized headers for preflight requests
  // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();

  app.options('*', (req, res) => {
      // allowed XHR methods  
      res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
      res.send();
  });
});

app.set('view engine','pug');


// recuperer la liste des clients
app.get('/', (req, res) => {
  res.redirect('/movies');
});

app.get('/movie/:title', (req, res) => {
  res.render('movie', { title: 'http://localhost:5000/video/'+req.params.title, subtitles: 'http://localhost:5000/subtitle/'+req.params.title });
});

app.get('/video/:title', (req, res) => {
  // play the video
  // https://webomnizz.com/video-stream-example-with-nodejs-and-html5/
  // can't work with .avi

  const path = 'public/media/'+req.params.title+'.mp4';

  var mime = 'video/mp4';

  fs.stat(path, (err, stat) => {

      // Handle file not found
      if (err !== null && err.code === 'ENOENT') {
          res.sendStatus(404);
      }

      const fileSize = stat.size
      const range = req.headers.range

      if (range) {

          const parts = range.replace(/bytes=/, "").split("-");

          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
          
          const chunksize = (end-start)+1;
          const file = fs.createReadStream(path, {start, end});
          const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': mime,
          }
          
          res.writeHead(206, head);
          file.pipe(res);
      } else {
          const head = {
              'Content-Length': fileSize,
              'Content-Type': mime,
          }

          res.writeHead(200, head);
          fs.createReadStream(path).pipe(res);
      }
  });
});

app.get('/subtitle/:title', (req, res) => {
  // play the video
  // https://webomnizz.com/video-stream-example-with-nodejs-and-html5/

  const path = 'public/media/'+req.params.title+'.vtt'
  const srt = 'public/media/'+req.params.title+'.srt'

  fs.stat(srt, (err, stat) => {
    if (err !== null && err.code === 'ENOENT') {}
    // if there is .srt
    else {
      fs.stat(path, (err, stat) => {

        // but no .vtt
        if (err !== null && err.code === 'ENOENT') {
          // convert .srt to .vtt
          fs.createReadStream(path.split('.vtt')[0]+'.srt')
          .pipe(srt2vtt())
          .pipe(fs.createWriteStream(path.split('.vtt')[0]+'.vtt'))
          .on('finish', function () { 
            console.log('.vtt created');
           });
        } else {
            const fileSize = stat.size
            const range = req.headers.range
    
            if (range) {
    
                const parts = range.replace(/bytes=/, "").split("-");
    
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                
                const chunksize = (end-start)+1;
                const file = fs.createReadStream(path, {start, end});
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                }
                
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                }
    
                res.writeHead(200, head);
                fs.createReadStream(path).pipe(res);
            }
          }
      });
    }
  })
});

app.get('/movies', (req, res) => {
  res.render('movies', {movies: aMovies});
});


app.listen(port, () => {
console.log(`Server is listening on port ${port}`);
});

async function searchByName(name) {
  if (name != undefined) {
      const response = await fetch(search_url+api_key+'&query='+encodeURI(name)+'&language=fr');
      const movies = await response.json();
      var results = movies.results;
      if (results.length > 0) {
        var first_result = results[0];
        var img = img_url+first_result.poster_path;
        if (first_result.poster_path == null) img = './no-img.png';
        var movie = new Movie(name, first_result.title, first_result.overview, img, results);
        aMovies.push(movie);
      }
  }
}
  
searchByName().then(movies => {
  movies; // fetched movies
});

class Movie {
    constructor(filename, title, description, img, results) {
        this.filename = filename;
        this.title = title;
        this.description = description;
        this.img = img;
        this.results = results;
    }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   