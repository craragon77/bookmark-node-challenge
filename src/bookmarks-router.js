const express = require('express')
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const {v4: uuid} = require('uuid');
const logger = require('./logger');

const bookmarks = [{
    id: 1,
    title: 'Appalachian Trail Website',
    url: 'https://appalachiantrail.org/',
    rating: 5
}, {
    id: 2,
    title: 'Pacific Crest Trail website',
    url: 'https://www.pcta.org/',
    rating: 5
}]

bookmarkRouter
    .route('/bookmarks')
    .get((req,res) => {
        res.json(bookmarks)
        })
    .post((req,res) => {
        const {title, url, rating} = req.query
        if(!title){
            logger.error(`Title is required`);
            return res.status(400).send('Invalid title');
        }
        if(!url){
            logger.error(`Content is required`);
            return res.status(400).send('Invalid url');
        }
        if(!rating){
            logger.error(`Rating is Required`)
            return res.status(400).send('Invalid rating')
        }
        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            rating
        };
        bookmarks.push(bookmark)
        logger.info(`Bookmark with id ${id} created!`)
            res.status(201).location(`http://localhost:8000/list/${id}`).json({id})
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req,res) => {
        const {id} = req.params;
    const bookmark = bookmarks.find(b => b.id == id)

    if(!bookmark){
        logger.error(`bookmark with id ${id} not found`)
        return res.status(404).send('bookmark not found :(')
    }
    res.json(bookmark)
    })
    .delete((req, res) => {
        const {id} = req.params;
        const bookmarkIndex = bookmarks.findIndex(li => li.id == id);

        if(bookmarkIndex === -1){
            logger.error(`List with id ${id} not found`);
            return res.status(404).send('Not Found');
        }
        
        bookmarks.splice(bookmarkIndex, 1);
        logger.info(`List with id ${id} deleted`);
        res.status(204).end()
    })

module.exports = bookmarkRouter