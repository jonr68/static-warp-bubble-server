const fs = require("fs");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Takes filename from frontend and finds the corresponding file, reads the HTML and returns the information as JSON to frontend
app.get("/blog", (req, res) => {
  const fileName = req.body;
  if (!fileName) {
    return res.sendStatus(400);
  }
  fs.readFile(`./${fileName.fileName}`, "utf8", (err, data) => {
    if (err) {
      console.error("An error occurred:", err.message);
      return res.sendStatus(400);
    }
    //Changes HTML to JSON format
    const lowercaseKeys = data
      .replace("Author", "author")
      .replace("Supject", "subject")
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
  const { author, subject, blog, publish, publishDate } = req.body;
  if (!author || !subject || !blog || !publish || !publishDate) {
    return res.sendStatus(400);
  }
  res.sendStatus(201);
  const id = subject.replaceAll(" ", "-");

  const newBlog = {
    id: id,
    author: author,
    subject: subject,
    blog: blog,
    publish: publish,
    publishDate: publishDate,
  };
  //func to write file with HTML formatting
  fs.writeFile(
    `./blog-${id}.html`,
    `<h1> Author: ${newBlog.author} </h1> <h2> Supject: ${newBlog.subject} </h2> <h2> Blog: ${newBlog.blog} </h2> <p> Published On: ${newBlog.publishDate} </p> <p hidden="">publish: ${publish}</p>`,
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file created");
      }
    },
  );
});

app.get("/blogdelete", (req, res) => {
  const body = req.body;
  const fileName = body.fileName;
  console.log(fileName);
  if (!fileName) {
    return res.sendStatus(400);
  } else {
    fs.unlink(`./${fileName}`, (err) => {
      if (err) {
        console.log(err.message);
      }
      console.log(`${fileName} Deleted`);
      return res.send(`${fileName} Was Deleted`);
    });
  }
});

app.listen(3000, (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log(`Example app listening on port ${3000}`);
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
