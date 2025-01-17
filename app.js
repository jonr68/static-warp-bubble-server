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

    if (!author || !subject || !publishDate || !blog) {
        return res.sendStatus(400)
    }res.sendStatus(201)
})
    const blgID = uuid();

    const newBlog = {
        id: blgID,
        author: author,
        subject: subject,
        publishDate:publishDate,
        blog: blog,
    }

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
