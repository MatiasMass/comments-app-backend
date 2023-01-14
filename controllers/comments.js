const express = require('express')
// const app = express()
// const app = require('../app') // the actual Express application
const session = require('express-session')
const commentsRouter = require('express').Router()

const Comment = require('../models/comment')

// app.use(session({
//   secret: '123',
//   resave: true,
//   saveUninitialized: true
// }))

commentsRouter.get('/', async (request, response) => { // 
  
  // request.session.usuario = "matias"
  // request.session.rol = "admin"
  // request.session.visit = request.session.visit ? request.session.visit + 1 : 1

  // console.log(request.session.visit)
  const notes = await Comment.find({})
  response.json(notes)
})

commentsRouter.get('/:id', async (request, response) => { // 
    console.log(request.params.id)
  const comment = await Comment.findById(request.params.id)

  if (comment) {
    response.json(comment.toJSON())
  } else {
    response.status(404).end()
  }
})

commentsRouter.post('/', async (request, response) => {
  const { content, likes, dislikes } = request.body

  const comments = await Comment.find({})

  const comment = new Comment({
    content,
    likes,
    dislikes,
    liked_by: [],
    disliked_by: [],
    date: new Date(),
  })

  const commentSaved = await comment.save()
  comments.concat(commentSaved)

  response.status(201).json(commentSaved)
})


commentsRouter.put('/:id', (request, response, next) => {

  const ip = request.ip;
  console.log('ip', ip);

  const body = request.body

  const user = request.headers['x-username'] 
  if (!user){
    throw new Error('User is required')
  }

  Comment.findById(request.params.id).then((dbComment) => {

    let comment = {
      content: body.content,
      likes: dbComment.likes,
      dislikes: dbComment.dislikes,
      liked_by: dbComment.liked_by,
      disliked_by: dbComment.disliked_by
    }

    if (body.isLiked){
      if (dbComment.liked_by.includes(user)){
        const likedUserIndex = dbComment.liked_by.indexOf(user)
        console.log('likedUserIndex', likedUserIndex)
        comment.liked_by.splice(likedUserIndex, 1)
        console.log('liked_by', comment.liked_by)
        comment.likes = comment.liked_by.length
      } else {
        comment.liked_by = dbComment.liked_by.concat(user)
        comment.likes = comment.liked_by.length 
      }
    }

    if (body.isDisliked){
      if (dbComment.disliked_by.includes(user)){
        const dislikedUserIndex = dbComment.disliked_by.indexOf(user)
        console.log(dislikedUserIndex)
        comment.disliked_by.splice(dislikedUserIndex, 1)
        comment.dislikes = comment.disliked_by.length
      } else {
        comment.disliked_by = dbComment.disliked_by.concat(user)
        comment.dislikes = comment.disliked_by.length
      }
    }

    // console.log(comment)
    
  Comment.findByIdAndUpdate(request.params.id, comment, { new: true })
    .then(updatedComment => {
      response.json(updatedComment)
    })
    .catch(error => next(error))
  }).catch(error => next(error))
})

module.exports = commentsRouter