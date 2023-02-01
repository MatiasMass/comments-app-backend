const express = require("express");
const cookieParser = require("cookie-parser");
const commentsRouter = require("express").Router();

const Comment = require("../models/comment");

commentsRouter.get("/", async (request, response) => {
  //
  // random number between 1 and 100000
  const randomNumber = Math.floor(Math.random() * 100000) + 1;
  
  if (request.cookies.user) {
    console.log('Bienvenido de vuelta!');
  } else {
    response.cookie('user', `${randomNumber}`, { maxAge: 900000, httpOnly: true });
    console.log('Bienvenido por primera vez!');
  }

  //   response.cookie('user', 'userX', {
  //     maxAge: 5000, // 100 horas tiempo de expiracion de la cookie, es decir, cuanto dura
  //     // expires: new Date(Date.now() + 1000 * 60 * 60 * 100), // 100 horas
  //     // expires: new Date(Date.now() + 5000), // 5 segundos
  //     httpOnlsetcookiey: true, // no se puede acceder desde el cliente
  //     // secure: false, // solo se puede acceder por https, es muy importanto activarlo en produccion
  //     // sameSite: 'lax', // solo se puede acceder desde el mismo dominio
  // }); // es una variable clave valor

  const notes = await Comment.find({});
  response.json(notes);
});

commentsRouter.get("/:id", async (request, response) => {
  //
  console.log(request.params.id);
  const comment = await Comment.findById(request.params.id);

  if (comment) {
    response.json(comment.toJSON());
  } else {
    response.status(404).end();
  }
});

commentsRouter.post("/", async (request, response) => {
  const { content, likes, dislikes } = request.body;

  const comments = await Comment.find({});

  const comment = new Comment({
    content,
    likes,
    dislikes,
    liked_by: [],
    disliked_by: [],
    date: new Date(),
  });

  const commentSaved = await comment.save();
  comments.concat(commentSaved);

  response.status(201).json(commentSaved);
});

commentsRouter.put("/:id", (request, response, next) => {
  const body = request.body;

  const user = request.cookies.user;
  // console.log('user', user)
  if (!user) {
    throw new Error("User is required");
  }

  Comment.findById(request.params.id)
    .then((dbComment) => {
      let comment = {
        content: body.content,
        likes: dbComment.likes,
        dislikes: dbComment.dislikes,
        liked_by: dbComment.liked_by,
        disliked_by: dbComment.disliked_by,
      };

      if (body.isLiked) {
        if (dbComment.liked_by.includes(user)) {
          const likedUserIndex = dbComment.liked_by.indexOf(user);
          // console.log('likedUserIndex', likedUserIndex)
          comment.liked_by.splice(likedUserIndex, 1);
          // console.log('liked_by', comment.liked_by)
          comment.likes = comment.liked_by.length;
        } else {
          comment.liked_by = dbComment.liked_by.concat(user);
          comment.likes = comment.liked_by.length;
        }
      }

      if (body.isDisliked) {
        if (dbComment.disliked_by.includes(user)) {
          const dislikedUserIndex = dbComment.disliked_by.indexOf(user);
          // console.log(dislikedUserIndex)
          comment.disliked_by.splice(dislikedUserIndex, 1);
          comment.dislikes = comment.disliked_by.length;
        } else {
          comment.disliked_by = dbComment.disliked_by.concat(user);
          comment.dislikes = comment.disliked_by.length;
        }
      }

      console.log(comment);

      Comment.findByIdAndUpdate(request.params.id, comment, { new: true })
        .then((updatedComment) => {
          response.json(updatedComment);
          // response.clearCookie('user');
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

module.exports = commentsRouter;
