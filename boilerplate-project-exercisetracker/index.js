const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { User, Exercise } = require('./db')

app.use(cors())
app.use(express.static('public'))

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/hello', (req, res) => {
  res.json({greeting: "Hi there"});
});

app.post('/api/users/', async (req, res) => {
  try {
  const username = req.body.username;
  const newUser = new User( { username })
  const savedUser = await newUser.save();
  res.json( { username: savedUser.username, _id: savedUser._id } );
  console.log(savedUser);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating user');
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try{
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    // checking if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // parse data
    const exerciseDate = date ? new Date(date) : new Date();

    const newExercise = new Exercise( {
      userId,
      description,
      duration,
      date: exerciseDate
    });

    const savedExercise = await newExercise.save();

    // respond
    res.json( {
      _id: userId,
      username: user.username,
      date: savedExercise.date.toDateString,
      duration: savedExercise.duration,
      description: savedExercise.description
    });
   
  } catch (err) {
    console.log(err);
    res.status(500).send('Error saving exercise');
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
