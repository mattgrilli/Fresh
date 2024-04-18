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
const profileRoutes = require('./routes/profile');
const { ensureAuthenticated } = require('./auth');
const Comment = require('./models/Comment');
// app.js
const { timeElapsed } = require('./utils');
// Import the knowledge base routes
const knowledgeBaseRoutes = require('./routes/knowledge-base');





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


require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
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
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Add the middleware to log the requested URLs
app.use((req, res, next) => {
  console.log('Requested URL:', req.url);
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
app.use((req, res, next) => {
  if (req.user && req.user.isAdmin) {
    res.locals.isAdmin = true;
  } else {
    res.locals.isAdmin = false;
  }
  next();
});


// Set up routes
app.use('/', profileRoutes);

const knowledgeBaseRouter = express.Router();
app.use('/knowledge-base', knowledgeBaseRouter);
knowledgeBaseRouter.use('/', knowledgeBaseRoutes);



app.get("/", async (req, res) => {
  await renderSnippets(req, res, false);
});

app.get("/my-snippets", ensureAuthenticated, async (req, res) => {
  console.log("User object in index route:", req.user);
  await renderSnippets(req, res, true);
});

async function renderSnippets(req, res, isMySnippets) {
  const languages = [
    'JavaScript',
    'Python',
    'Ruby',
    'TypeScript',
    'Command Prompt',
    'PowerShell',
    'Bash',
    'HTML',
    'CSS',
    'SQL',
    'PHP',
    'Java',
    'C++',
    'C#',
    'Swift',
    'Go',
    'Kotlin',
    'Rust',
    'text'
  ];
  const sort =
    req.query.sort
      ? {
          [req.query.sort.split(":")[0]]: parseInt(req.query.sort.split(":")[1]),
        }
      : { createdAt: -1 };

  const languageFilter = req.query["filter[language]"]
    ? req.query["filter[language]"].split(",")
    : [];

  let filter = {};
  if (languageFilter.length > 0) {
    filter.language = { $in: languageFilter };
  }

  if (isMySnippets) {
    filter.owner = req.user._id;
  }

  try {
    const snippets = await Snippet.find(filter).sort(sort).populate({
      path: 'owner',
      populate: {
        path: 'profileImage',
      },
    }).populate({ path: 'comments', populate: { path: 'author', populate: { path: 'profileImage' } } });

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

    const user = req.user ? await User.findById(req.user._id).populate('profileImage') : null;

    // Add the comment count to each snippet
    const snippetsWithCommentCount = snippets.map(snippet => {
      return {
        ...snippet.toObject(),
        commentCount: snippet.comments.length
      };
    });

    // Pass both snippets, snippetCounts, and the user object to the view
    res.render("index", {
      snippets: snippetsWithCommentCount,
      noSnippets,
      snippetCounts,
      user,
      languages,
      sort: req.query.sort || "createdAt:-1",
      languageFilter: req.query["filter[language]"] || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}




// After your Passport.js middleware in app.js
app.use((req, res, next) => {
  console.log('Checking authentication...');
  console.log('req.user:', req.user);
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  console.log('req.isAuthenticated():', req.isAuthenticated());
  next();
});






app.get('/admin/panel', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('admin/admin-panel', { user: req.user });
});

async function ensureAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  const snippetId = req.params.id;
  try {
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(404).send('Snippet not found');
    }
    if (snippet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send('You are not authorized to edit or delete this snippet');
    }
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred while retrieving the snippet');
  }
}


async function ensureAdminOrCommentOwner(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  const commentId = req.params.commentId; // Update this line
  console.log('commentId:', commentId);
  try {
    const comment = await Comment.findById(commentId);
    console.log('comment:', comment);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).send('You are not authorized to edit or delete this comment');
    }
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred while retrieving the comment');
  }
}



app.get('/snippet/:id', async (req, res) => {
  console.log("User object in snippet route:", req.user);
  try {
    const snippet = await Snippet.findById(req.params.id).populate({
      path: 'owner',
      populate: {
        path: 'profileImage',
      },
    });
    if (!snippet) {
      res.status(404).send('Snippet not found');
    } else {
      const comments = await Comment.find({ snippet: req.params.id }).populate('author');
      const link = 'http://' + req.headers.host + '/snippet/' + snippet._id;
      const isAuthenticated = req.isAuthenticated();
      
      // Populate the profileImage property for req.user
      const currentUser = req.user
        ? await User.findById(req.user._id).populate('profileImage')
        : null;

      const isAdmin = currentUser && currentUser.isAdmin;
      res.render('snippet', { snippet, link, comments, isAuthenticated, timeElapsed: timeElapsed, currentUser, isAdmin, user: currentUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});







// Route to create a new comment for a snippet
app.post('/snippet/:id/comment', ensureAuthenticated, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      res.status(404).send('Snippet not found');
      return;
    }

    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      snippet: req.params.id,
    });

    await comment.save();
    snippet.comments.push(comment);
    await snippet.save();

    res.redirect(`/snippet/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while creating the comment');
  }
});

app.get('/snippet/:snippetId/comment/:commentId/edit', ensureAuthenticated, ensureAdminOrCommentOwner, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ comments: req.params.commentId });
    if (!snippet) {
      res.status(404).send('Snippet not found');
      return;
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      res.status(404).send('Comment not found');
      return;
    }

    res.render('comment_edit', {
      snippet,
      comment,
      currentUser: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving the comment');
  }
});


app.post('/snippet/:snippetId/comment/:commentId/update', ensureAuthenticated, ensureAdminOrCommentOwner, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      res.status(404).send('Comment not found');
      return;
    }

    comment.content = req.body.content;
    await comment.save();

    res.redirect(`/snippet/${req.params.snippetId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the comment');
  }
});

app.post('/snippet/:snippetId/comment/:commentId/delete', ensureAuthenticated, ensureAdminOrCommentOwner, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      res.status(404).send('Comment not found');
      return;
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.redirect(`/snippet/${req.params.snippetId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while deleting the comment');
  }
});




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



app.get('/admin/usermgmt', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });
    res.render('admin/usermgmt', { users: users }); // Remove the leading slash here
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
});






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
    const snippet = new Snippet({ name, code, description, language, owner: req.user._id, creator: req.user._id });

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


app.post('/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { name, code, description, language } = req.body;
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      console.log(`Snippet ${req.params.id} not found`);
      res.status(404).send('Snippet not found');
      return;
    }
    if (snippet.owner && snippet.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      console.log(`User ${req.user.username} with ID ${req.user._id} attempted to edit snippet ${snippet._id} which they do not own`);
      res.status(403).send('You are not authorized to edit this snippet');
      return;
    }
    const existingSnippet = await Snippet.findOne({ $or: [{ name }, { code }] });
    if (existingSnippet && existingSnippet._id.toString() !== req.params.id) {
      console.log(`User ${req.user.username} with ID ${req.user._id} attempted to edit snippet ${snippet._id} but the new name or code already exists`);
      return res.render('edit', {
        snippet,
        error: 'A snippet with that name or code already exists.'
      });
    }

    // If the owner field is null, set it to the current user
 // If the owner field is null, set it to the current user
if (!snippet.owner && req.user.isAdmin) {
  snippet.owner = req.user._id;
}


    snippet.name = name;
    snippet.code = code;
    snippet.description = description;
    snippet.language = language;

    // Update the updatedAt field or set it to the current date if it's null
    snippet.updatedAt = snippet.updatedAt ? Date.now() : snippet.updatedAt;

    await snippet.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

app.post('/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      console.log(`Snippet ${req.params.id} not found`);
      req.flash('error', 'Snippet not found');
      res.redirect('/');
      return;
    }
    if (snippet.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      console.log(`User ${req.user.username} with ID ${req.user._id} attempted to delete snippet ${snippet._id} which they do not own`);
      req.flash('error', 'You are not authorized to delete this snippet');
      res.redirect('/');
      return;
    }
    await Snippet.findByIdAndDelete(req.params.id);
    req.flash('success', 'Snippet successfully deleted');
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while deleting the snippet');
    res.redirect('/');
  }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Export ensureAuthenticated
module.exports = { ensureAuthenticated };
