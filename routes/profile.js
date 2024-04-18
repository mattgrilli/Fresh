const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Image = require('../models/Image');
const { ensureAuthenticated } = require('../auth');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/update-profile-image', upload.single('profileImage'), async (req, res) => {
  console.log('Request user:', req.user);

  try {
    const image = new Image({
      filename: req.file.filename,
      uploader: req.user._id,
    });

    await image.save();

    const user = await User.findByIdAndUpdate(req.user._id, { profileImage: image._id }, { new: true });
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('profileImage');
    res.render('profile', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;