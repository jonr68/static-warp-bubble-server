const fs = require('fs');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const {v4:uuid} = require('uuid');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/hello', (req, res) => {
    res.send('Hello World!')
})

app.post('/blog', (req, res) => {
    const {author, subject, blog, publish, publishDate } = req.body;
    const id = subject.replace(' ', '-');

    if (!author || !subject || !blog || !publish || !publishDate) {
        return res.sendStatus(400)
    }res.sendStatus(201)

    const newBlog = {
        id: id,
        author: author,
        subject: subject,
        blog: blog,
        publish: publish,
        publishDate: publishDate,

    };


    fs.writeFile(`./blog-${id}.HTML`,
        `<h1> Author: ${newBlog.author} </h1> <h2> Supject: ${newBlog.subject} </h2> <h2> Blog: ${newBlog.blog} </h2> <p> Published On: ${newBlog.publishDate} </p>`, err => {
        if (err) {
            console.log(err);
        } else {
            console.log('file created');
        }
    });

});

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
