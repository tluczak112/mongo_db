var request = require("request");
var cheerio = require("cheerio");
var Article = require('../models/Article')
var Note = require('../models/Note')

module.exports = function(router) {

	router.get("/", function(req, res){
		Article.find({
			saved: false
		}, function(err, doc) {
		if (err) {
			res.send(err);
		}

		else{
			res.render("home", {article: doc} );
		}
		});
	})
  router.get("/saved", function(req, res) {
  	 Article.find({saved: true}).populate("notes", 'body').exec(function(err, doc) {
    if (err) {
      res.send(err);
    }
    else {
      res.render("saved", {saved: doc});
    }
  	});
  });

  router.get('/scrape', function(req, res){
  request("http://www.foxnews.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("h2.title").each(function(i, element) {

      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  res.redirect("/");
  })

  router.post("/saved/:id", function(req, res) {
	  Article.update({_id: req.params.id}, {$set: {saved: true}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/");
	    }
	  });
	});

	router.post("/delete/:id", function(req, res){
		 Article.update({_id: req.params.id}, {$set: {saved: false}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	})

	router.post("/saved/notes/:id", function(req, res) {
	  var newNote = new Note(req.body);
	  console.log("new note" + newNote);
	  newNote.save(function(error, doc) {
	    if (error) {
	      res.send(error);
	    }
	    else {
	      Article.findOneAndUpdate({_id: req.params.id}, { $push: { "notes": doc._id } }, { new: true }).exec(function(err, newdoc) {
	        if (err) {
	          res.send(err);
	        }
	        else {
	          res.redirect("/saved");
	        }
	      });
	    }
	  });
	});

	router.post("/saved/delete/:id", function(req, res) {
	  Note.remove({_id: req.params.id}, function(err, doc){
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	});
}