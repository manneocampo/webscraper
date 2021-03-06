var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

//logger logs requests
app.use(logger("dev"));

//use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

//to serve the public folder as a static directory
app.use(express.static("public"));

//mongoose set to leverage built in JS ES6 promises
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/webscraper", {
  useMongoClient: true
});

//Routes

//A GET route for scraping the website
app.get("/scrape", function(req, res) {
  request.get("https://pharmacy.unc.edu/research/centers/cpit/cpit-news/", function(err, response) {
    var $ = cheerio.load(response.body);
    $("div.iso-post").each(function(i, element) {
      var result = {};
      // console.log('!@#!@#: ', $(this).children("a"))
      result.title = $(this)
      .children()
      .text();
      result.link = $(this)
      .children()
      .attr("href");

    //If this found element had both a title and a link
      if (result.title && result.link) {
        db.Article
        .find({title: result.title})
        .then((docs) => {
          if (docs.length <= 0) {
            db.Article
            .create(result)
            .then(function(dbArticle) {
              console.log("db article", dbArticle);
              db.Article
              .find()
              .then(function(dbArticle) {
                res.json(dbArticle);
              })
              .catch(function(err) {
                res.json(err);
              });
            })
            .catch(function(err) {
              console.log('catch')

              return res.json(err);
            });
          } else {
            db.Article
            .find()
            .then(function(dbArticle) {
              res.json(dbArticle);
            })
            .catch(function(err) {
              res.json(err);
            });
          }
        });
      };
    });
  });
});

//route for grabbing a specific article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  db.Article
  .findOne({ _id: req.params.id })
  .populate("note")
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

//Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  //Create a new note and pass the req.body to the entry
  db.Note
  .create(req.body)
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote.id }, { new: true });
  })
  .then(function(dbArticle) {
    //If successfully update an Article, send back to client
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});


app.listen(PORT, function() {
  console.log("App running on port" + PORT +"!");
});
