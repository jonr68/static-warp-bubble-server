const fs = require("fs");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Takes filename from frontend and finds the corresponding file, reads the HTML and returns the information as JSON to frontend
app.get("/blog", (req, res) => {
  const fileName = req.body;
  if (!fileName) {
    return res.sendStatus(400);
  }
  fs.readFile(`./blogs/${fileName.fileName}`, "utf8", (err, data) => {
    if (err) {
      console.error("An error occurred:", err.message);
      return res.sendStatus(400);
    }
    //Changes HTML to JSON format
    const lowercaseKeys = data
      .replace("Author", "author")
      .replace("Subject", "subject")
      .replace("Blog", "blog")
      .replace("Published On", "publishDate");
    const removeTags = lowercaseKeys.replaceAll(/<[^>]+>/g, '"');
    const addFirstQuotes = removeTags.replaceAll("(\\w+)", '"$1"');
    const addSecondQuotes = addFirstQuotes.replaceAll(":", '" : "');
    const addComma = addSecondQuotes.replaceAll('" "', '","');
    const bracedText = "{" + addComma + "}";
    const removeExtraSpaces = bracedText
      .replaceAll('" ', '"')
      .replaceAll('"  ', '"')
      .replaceAll(' "', '"')
      .replaceAll('  "', '"');
    const jsonObject = JSON.parse(removeExtraSpaces);
    return res.send(jsonObject);
  });
});

/*Takes blog information from frontend and injects it into HTML and saves
 file using the subject as ID*/
app.post("/blog", (req, res) => {
  const {author, subject, blog, publish, publishDate} = req.body;
  if (!author || !subject || !blog || !publish || !publishDate) {
    return res.sendStatus(400);
  }
  res.sendStatus(201);
  const id = publishDate + "-" + subject.replaceAll(" ", "-").replaceAll(/[!@#$%^&*?]/g, '');

  const newBlog = {
    id: id, author: author, subject: subject, blog: blog, publish: publish, publishDate: publishDate,
  };
  //func to write file with HTML formatting
  const html = ''
  fs.writeFile(`./blogs/blog-${id}.html`, `<h1> Author: ${newBlog.author} </h1> <h2> Subject: ${newBlog.subject} </h2> <h2> Blog: ${newBlog.blog} </h2> <p> Published On: ${newBlog.publishDate} </p> <p hidden="">publish: ${publish}</p>`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("file created");
    }
  },);

  // Read the HTML file
  fs.readFile('./frontend pages/blog-list-page.html', 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Error reading the HTML file');
      return;
    }

    // Content to add
    const newContent = `<h2> <a href='http://localhost:3000/blog-${newBlog.id}.html'>${newBlog.subject} </a></h2>`;

    // Add the new content to the HTML
    if (!html.includes(newContent)) {
      const modifiedHTML = html + newContent
      // Write the modified HTML back to the file
      fs.writeFile('./frontend pages/blog-list-page.html', modifiedHTML, (err) => {
        if (err) {
          res.status(500).send('Error writing the HTML file');
          return;
        }
        console.log('HTML file updated.');

      })
    }
  });

});

//removes blog file from dir and link from list page
//delete request for filename and blog subject
app.delete("/blog", (req, res) => {
  const body = req.body;
  const fileName = body.fileName;
  const subject = body.subject;
  //Checks that file name and subject weresent
  if (!fileName || !subject) {
    return res.status(400).send('Missing fileName or subject');
  } else {
    fs.readFile('./frontend pages/blog-list-page.html', 'utf8', (err, html) => {
      if (err) {
        res.status(500).send('Error reading the HTML file or blog subject');
        return;
      }

      // removes link from list page
      const blogToRemove = `<h2> <a href='http://localhost:3000/${fileName}'>${subject} </a></h2>`;
      console.log(blogToRemove);
      // Add the new content to the HTML
      if (html.includes(blogToRemove)) {
        const modifiedHTML = html.replace(blogToRemove, "");
        // Write the modified HTML back to the file
        fs.writeFile('./frontend pages/blog-list-page.html', modifiedHTML, (err) => {
          if (err) {
            res.status(500).send('Error writing the HTML file');
            return;
          }
          console.log('HTML file updated.');

        })
        //deletes file from blogs directory
        fs.unlink(`./blogs/${fileName}`, (err) => {
          if (err) {
            console.log(err.message);
            return res.send(err.message);
          }
          return res.send(`${fileName} Was Deleted`);
        });
      } else {
        return res.sendStatus(400);
      }
    });


  }


});


app.use(express.static("./blogs/"));

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
