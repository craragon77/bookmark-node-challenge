require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config')
const winston = require('winston');
const {v4: uuid} = require('uuid');

const app = express()
console.log(process.env.API_TOKEN)


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())

const bookmarks = [{
    id: 1,
    title: 'Appalachian Trail Website',
    url: 'https://appalachiantrail.org/'
}, {
    id: 2,
    title: 'Pacific Crest Trail website',
    url: 'https://www.pcta.org/'
}]

app.use(function validateBearerToken(req,res,next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    debugger
    if(!authToken || authToken.split(' ')[1] !== apiToken){
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({filename: 'info.log'})
    ]
})

if (NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

app.get('/', (req,res) => {
    res.send('Hello, Dave')
})

app.get('/bookmarks', (req,res) => {
    res.json(bookmarks)
})

app.get('/bookmarks/:id', (req,res) => {
    const {id} = req.params;
    const bookmark = bookmarks.find(b => b.id == id)

    if(!bookmark){
        logger.error(`bookmark with id ${id} not found`)
        return res.status(404).send('bookmark not found :(')
    }
    res.json(bookmark)
})

app.post('/bookmarks', (req,res) => {
    const {title, url} = req.query
    if(!title){
        logger.error(`Title is required`);
        return res.status(400).send('Invalid Data');
    }
    if(!url){
        logger.error(`Content is required`);
        return res.status(400).send('Invalid data');
    }
    const id = uuid();
    const bookmark = {
        id,
        title,
        url
    };
    bookmarks.push(bookmark)
    logger.info(`Bookmark with id ${id} created!`)
    res.status(201).location(`http://localhost:8000/list/${id}`).json({id})
})

app.delete('list/:id', (req,res) => {
    const {id} = req.params;
    const listIndex = lists.findIndex(li => li.id == id);

    if(listIndex === -1){
        logger.error(`List with id ${id} not found`);
        return res.status(404).send('Not Found');
    }

    listIndex.splice(listIndex, 1);
    logger.info(`List with id ${id} deleted`);
    res.status(204).end()
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
    })

module.exports = app