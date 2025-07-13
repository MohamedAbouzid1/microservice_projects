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
      date: savedExercise.date.toDateString(),
      duration: savedExercise.duration,
      description: savedExercise.description
    });
   
  } catch (err) {
    console.log(err);
    res.status(500).send('Error saving exercise');
  }
});

// get user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  const user = await User.findById(userId);


  // checking if user exists
  if (!user) return res.status(404).send('User not found');

  // Build the query object
  let query = { userId };

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  let exercisesQuery = Exercise.find(query).select('description duration date');

  // Apply limit if provided
  if (limit) {
    exercisesQuery = exercisesQuery.limit(Number(limit));
  }
  
  const exercises = await exercisesQuery.exec();

  const log = exercises.map( ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString(),
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log
  });
  } catch (err) {
    console.log(err);
    res.status(500).send('No exercises found for this user!')
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
