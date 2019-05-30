var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Set Handlebars.
// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");


// Connect to the Mongo DB
var MONGODB_URI =process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
mongoose.connect(MONGODB_URI);
// Delete old working connection below in event new MONGODB_URI has issues that need troubleshooting
// mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

//=====================================================
// Import routes and give the server access to them.
// var routes = require("./controllers/newsController.js");

// app.use(routes);
//=====================================================


//===================================================================================
// FOR TEST AND REFERENCE PURPOSES ONLY. DELETE AFTER SUCCESSFUL TEST WITH HANDLEBARS
//===================================================================================
// Routes

app.get("/scrape", function(req, res) {
  axios.get("https://www.newschannel5.com").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".showcase-big-row").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a").children(".ShowcasePromo").children(".ShowcasePromo-info").children("h3")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      // console.log(result);

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//========================================================================================================
//========================================================================================================

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  console.log("Server listening on: http://localhost:" + PORT);
});