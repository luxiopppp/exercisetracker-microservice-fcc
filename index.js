const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const mongoose = require('mongoose')
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new Schema({
  username: {type: String, required: true},
  log: [{
    description: String,
    duration: Number,
    date: String,
  }],
  count: {type: Number, default: 0},
});

const User = mongoose.model('User', userSchema);

app.route("/api/users")
  .post((req, res) => {
    let user = new User({ username: req.body.username })

    user.save()
      .then(data => res.json(data))
      .catch(err => console.error(err))
  })
  .get((req, res) => {
    User.find({})
      .then(data => res.json(data))
      .catch(err => console.error(err))
  })

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration } = req.body;
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  const id = req.params._id;

  const exercise = {
    description,
    duration: parseInt(duration),
    date,
  }
  
  User.findByIdAndUpdate(id, { $push: { log: exercise }, $inc: { count: 1 } }, { new: true })
    .then(user => {
      res.json({ username: user.username, ...exercise, _id: id})
    })
    .catch(err => console.error(err))
})

app.get("/mongo-health", (req, res) => {
  res.json({status: mongoose.connection.readyState})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
