// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const { Schema, model } = require('mongoose');

// Set up app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://snippet_user:password123@127.0.0.1:27017/snippets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to database!");
});



// Define Snippet schema
const SnippetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
});

// Create Snippet model
const Snippet = mongoose.model('Snippet', SnippetSchema);

// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { 
  setHeaders: (res, path, stat) => {
    res.set('Content-Type', 'text/css');
  }
}));
app.use(methodOverride('_method'));


// Set up routes

app.get('/', async (req, res) => {
  const snippets = await Snippet.find();
  const noSnippets = snippets.length === 0;

  // Calculate the snippet counts
  let snippetCounts = {};
  for (let i = 0; i < snippets.length; i++) {
    let lang = snippets[i].language;
    if (snippetCounts[lang]) {
      snippetCounts[lang]++;
    } else {
      snippetCounts[lang] = 1;
    }
  }

  // Pass both snippets and snippetCounts to the view
  res.render('index', { snippets, noSnippets, snippetCounts });
});


app.get('/snippet/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
    if (!snippet) {
      res.status(404).send('Snippet not found')
    } else {
      const link = 'http://' + req.headers.host + '/snippet/' + snippet._id
      res.render('snippet', { snippet, link })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal server error')
  }
})






app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', async (req, res) => {
  const { name, code, description, language } = req.body;
  try {
    const snippet = new Snippet({ name, code, description, language });
    await snippet.save();
    res.redirect('/');
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      // Duplicate key error
      res.render('create', { error: 'Snippet with that name already exists' });
    } else {
      console.error(err);
      res.render('error', { error: err });
    }
  }
});

app.get('/edit/:id', async (req, res) => {
  console.log(req.params); // log the params object
  const snippet = await Snippet.findById(req.params.id);
  res.render('edit', { snippet });
});

app.post('/edit/:id', async (req, res) => {
  const { name, code, description, language } = req.body;
  try {
    const snippet = await Snippet.findById(req.params.id);
    const existingSnippet = await Snippet.findOne({ $or: [{ name }, { code }] });
    if (existingSnippet && existingSnippet._id.toString() !== req.params.id) {
      return res.render('edit', {
        snippet,
        error: 'A snippet with that name or code already exists.'
      });
    }
    snippet.name = name;
    snippet.code = code;
    snippet.description = description;
    snippet.language = language;
    await snippet.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});




app.post('/delete/:id', async (req, res) => {
  await Snippet.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
