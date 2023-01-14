const mongoose = require('mongoose')

// const url = process.env.MONGODB_URI
const url = 'mongodb+srv://dbUser:VXdBinLQOWJUE6wi@cluster0.sfmy7.mongodb.net/Comments?retryWrites=true&w=majority'

mongoose.connect(url) // Se conecta a la base de datos

const commentSchema = new mongoose.Schema({
    content: {
      type: String,
      minlength: 0
    },
    date: Date,
    likes: Number,
    dislikes: Number
  })
  

const Comment = mongoose.model('Comment', commentSchema)

const comment = new Comment({
  content: 'Primer comentario',
  date: new Date(),
  likes: 23,
  dislikes: 1
})


comment.save().then(() => {
    console.log('comment saved!')
    mongoose.connection.close()
})


Comment.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})