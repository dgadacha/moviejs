const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fetch = require("node-fetch");

const api_key = '59dfba860b7c84402018a22f1ec7aa9a';
const langage = 'fr'
const search_url = 'https://api.themoviedb.org/3/search/movie?api_key='
const img_url = 'https://image.tmdb.org/t/p/w500'

const path = require('path');
const fs = require('fs');
const directoryPath = path.join(__dirname, '/media');

const port = process.env.PORT || 5000;
const pug = require('pug');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(bodyParser.json())

function getMovies(startPath,filter){
  //console.log('Starting from dir '+startPath+'/');
  if (!fs.existsSync(startPath)){
      console.log("no dir ",startPath);
      return;
  }

  var files=fs.readdirSync(startPath);
  for(var i=0;i<files.length;i++){
      var filename=path.join(startPath,files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()){
        getMovies(filename,filter); //recurse
      }
      else if (filename.indexOf(filter)>=0) {
          var name = filename.split('.mp4')[0].split('media\u005C')[1]
          searchByName(name);
          console.log(name);
      };
  };
};

getMovies('media','.mp4');

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
  console.log('get /');
  res.redirect('/movies');
});

app.get('/movies', (req, res) => {
  console.log("get /movies");
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
        var movie = new Movie(first_result.title, first_result.overview, img, results);
        aMovies.push(movie);
      }
  }
}
  
searchByName().then(movies => {
  movies; // fetched movies
});

class Movie {
    constructor(title, description, img, results) {
        this.title = title;
        this.description = description;
        this.img = img;
        this.results = "";
    }
}