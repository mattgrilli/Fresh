// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User');
const bcrypt = require('bcrypt');
// Import connect-flash
const flash = require('connect-flash');

// Include the passport configuration
require('./passport-config')(passport);

// Import models
const Snippet = require('./models/Snippet');
const Admin = require('./models/Admin');
const InvitationCode = require('./models/InvitationCode');

// Set up app
const app = express();

const expirationDate = new Date();
expirationDate.setHours(expirationDate.getHours() + 72);


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

// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/public/search.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript');
  next();
});

// Add session and Passport.js middleware
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up the flash middleware
app.use(flash());


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must be logged in to perform this action.');
  res.redirect('/login');
}


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

  // Pass both snippets, snippetCounts, and the user object to the view
  res.render('index', { snippets, noSnippets, snippetCounts, user: req.user });
});

app.get('/admin/panel', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('admin/admin-panel', { user: req.user });
});

function ensureAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.redirect('/');
}


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


app.get('/tasks', (req, res) => {
  res.render('tasks');
});

app.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
});


app.post('/register', async (req, res) => {
  const { username, email, password, passwordConfirm, invitationCode } = req.body;

  if (password !== passwordConfirm) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/register');
  }

  try {
    const invitationCodeRecord = await InvitationCode.findOne({ code: invitationCode });
    const currentTime = new Date();

    if (!invitationCodeRecord || currentTime > invitationCodeRecord.expirationDate) {
      req.flash('error', 'Invalid or expired registration code');
      return res.redirect('/login');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      invitationCode,
    });
    await user.save();
    res.redirect(`/success?username=${user.username}&email=${user.email}&password=${password}`);
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});



app.get('/success', (req, res) => {
  const { username, email, password } = req.query;
  res.render('success', { username, email, password });
});



app.post('/check-username', async (req, res) => {
  const username = req.body.username;
  const user = await User.findOne({ username: username });
  res.json({ isTaken: !!user });
});

app.post('/check-email', async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  res.json({ isTaken: !!user });
});



// Admin login route
app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));



app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});





// ... Other imports and configuration ...

// Add the generateRandomCode function
function generateRandomCode() {
  const length = 10;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// ... Other routes ...

app.post('/admin/generate-code', ensureAuthenticated, async (req, res) => {
  try {
    const code = generateRandomCode();

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 72);

    const invitationCode = new InvitationCode({
      code: code,
      expirationDate: expirationDate,
    });

    await invitationCode.save();
    res.json({ success: true, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to generate invitation code' });
  }
});


// ... Remaining app configuration ...


app.get('/create', ensureAuthenticated, (req, res) => {
  res.render('create');
});

app.post('/create', ensureAuthenticated, async (req, res) => {
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

app.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  console.log(req.params); // log the params object
  const snippet = await Snippet.findById(req.params.id);
  res.render('edit', { snippet });
});

app.post('/edit/:id', ensureAuthenticated, async (req, res) => {
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




app.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  await Snippet.findByIdAndDelete(req.params.id);
  res.redirect('/');
});


// Add the generateRandomCode function
function generateRandomCode() {
  const length = 10;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


async function createInitialAdmin() {
  const adminCount = await User.countDocuments({ isAdmin: true });
  if (adminCount === 0) {
    const initialAdminUsername = 'admin';
    const initialAdminPassword = 'E9aRhqAJc88Zsei7En80'; // Replace this with a strong password
    const hashedPassword = await bcrypt.hash(initialAdminPassword, 10);
    const admin = new User({
      username: initialAdminUsername,
      email: 'support@grilli.io', // Replace this with a valid email address
      password: hashedPassword,
      invitationCode: 'INITIAL_ADMIN',
      isAdmin: true,
    });
    await admin.save();
    console.log('Initial admin account created with username: admin');
  }
}

createInitialAdmin();

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
