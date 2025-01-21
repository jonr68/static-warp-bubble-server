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
    const {author, subject, publishDate, blog} = req.body;
    const id = subject.replace(' ', '-');

    if (!author || !subject || !publishDate || !blog) {
        return res.sendStatus(400)
    }res.sendStatus(201)

    // const newObject = {
    //     id: id,
    //     author: author,
    //     subject: subject,
    //     publishDate: publishDate,
    //     blog: blog,
    //
    // };


    fs.writeFile(`./blog-${id}.HTML`,
        `<h1> Author: ${author} </h1> <h2> Supject: ${subject} </h2> <h2> Blog: ${blog} </h2> <p> Published On: ${publishDate} </p>`, err => {
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
