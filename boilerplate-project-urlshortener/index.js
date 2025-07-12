require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


// middleware
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false} ));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let idCounter = 1;
let urlDatabase = [];

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  let hostName;

  try {
    const parsedUrl = new URL(originalUrl);
    hostName = parsedUrl.hostname;
  }
  catch (err) {
    res.json({ error: "Invalid URL!"});
  }

  dns.lookup(hostName, (err, address) => {
    if (err) {
      return res.json({error: "Invalid URL!"});
    } else {
      const shortUrl = idCounter ++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
})

// redirect endpoint
app.get('/api/shorturl/:id', function(req, res) {
  const id = parseInt(req.params.id);
  const found = urlDatabase.find(entry => entry.short_url = id);
  
  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json( {
      error: "Couldn't find the requested URL!"
    });
  }
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
