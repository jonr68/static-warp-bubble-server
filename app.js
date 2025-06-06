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
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Static Warp blog</title>
  <style>
    @media (max-width: 800px) {
    body > div {
    flex-direction: column !important;
    align-items: stretch !important;
    height: auto !important;
  }
    body > div > div,
    body > div > iframe {
    width: 90% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    margin: 2% 0 0 0 !important;
    height: auto !important;
  }
    body > div > iframe {
    min-height: 400px;
    height: 70vh !important;
  }
  }
  </style>
</head>
  <body style="background-color: lightgray">
  <div style="display: flex; align-items: flex-start; height: 100vh;">
    <div style="
      background-color: white;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      border-radius: 5px;
      padding: 16px;
      height: 75%;
      display: inline-block;
      text-align: center;
      margin: 5% 2% 0 10%;
      min-width: 350px;
      max-width: 600px;
      flex-shrink: 0;
    ">
      <div style="background-image: url('starfield2_0.png'); font-size: large; border: 1px solid black;"><h1 style="color: #7795d6; ">${newBlog.subject}</h1></div>
      <div><p style=" font-size: large; word-break: break-word; max-width: 100ch; text-align: left;">${newBlog.blog}</p></div>
      <div style="text-align: left; font-size: large; color: #808080"><p>Written By: ${newBlog.author}</p> <p> Published on: ${newBlog.publishDate}</p></div>
      <p hidden="">${newBlog.publish}</p>
      <p>* Google ads go here! *</p></div>
    <div style="position: absolute;
            bottom: 0px;

">
    </div>
    <iframe src="blog-list-templae.html"
            style="height: 75%; width: 600px; border: none; margin-top: 5%;">
    </iframe>
  </div>
  </body>
</html>`;


  fs.writeFile(`./blogs/blog-${id}.html`, html, (err) => {
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
