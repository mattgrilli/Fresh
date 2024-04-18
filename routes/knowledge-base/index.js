const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../auth');

// Import User, KnowledgeBase, and KnowledgeBaseEntry models
const User = require('../../models/User');
const KnowledgeBase = require('../../models/KnowledgeBase');
const KnowledgeBaseEntry = require('../../models/KnowledgeBaseEntry');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const knowledgeBases = await KnowledgeBase.find({ owner: req.user._id });
    const currentUser = req.user ? await User.findById(req.user._id).populate('profileImage') : null;
    res.render('knowledge-base/index', { knowledgeBases, user: currentUser });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const knowledgeBase = await KnowledgeBase.findById(req.params.id).populate('entries');
    
    if (!knowledgeBase) {
      return res.status(404).send('Knowledge base not found');
    }
    
    const currentUser = req.user ? await User.findById(req.user._id).populate('profileImage') : null;
    const entries = knowledgeBase.entries.map(entry => {
      const plainEntry = entry.toObject();
      return {
        ...plainEntry,
      };
    });

    res.render('knowledge-base/show', { knowledgeBase, entries, user: currentUser });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.post('/create-knowledge-base', ensureAuthenticated, async (req, res) => {
  // Destructure knowledgeBaseName from request body
  const { knowledgeBaseName } = req.body;

  try {
    // Create a new knowledge base with the provided name and associated owner
    const newKnowledgeBase = new KnowledgeBase({ name: knowledgeBaseName, owner: req.user._id });

    // Save the new knowledge base to the database
    await newKnowledgeBase.save();

    // Redirect the user to the knowledge base index page
    res.redirect('/knowledge-base');
  } catch (error) {
    // Log the error and send a 500 Internal Server Error status code
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


router.post('/:id/entries', ensureAuthenticated, async (req, res) => {
  try {
    const { title, entryContent, tags } = req.body; // Update the name of the input field to "entryContent"
    const knowledgeBaseId = req.params.id;

    const knowledgeBase = await KnowledgeBase.findById(knowledgeBaseId).populate('entries');
    if (!knowledgeBase) {
      return res.status(404).send('Knowledge base not found');
    }

    const parsedTags = tags.split(',').map(tag => tag.trim());

    const newEntry = new KnowledgeBaseEntry({
      title,
      entryContent: entryContent,
      tags: parsedTags,
      knowledgeBase: knowledgeBaseId,
      creator: req.user._id,
    });

    await newEntry.save();

    // Add the entry to the knowledge base's entries array
    knowledgeBase.entries.push(newEntry);
    await knowledgeBase.save();

    res.redirect(`/knowledge-base/${knowledgeBaseId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.get('/:kbId/entries/:entryId', ensureAuthenticated, async (req, res) => {
  try {
    const { kbId, entryId } = req.params;

    const knowledgeBase = await KnowledgeBase.findById(kbId);

    if (!knowledgeBase) {
      return res.status(404).send('Knowledge base not found');
    }

    const entry = await KnowledgeBaseEntry.findOne({ _id: entryId, knowledgeBase: kbId });

    if (!entry) {
      return res.status(404).send('Entry not found');
    }

    // Fetch the current user
    const currentUser = req.user ? await User.findById(req.user._id).populate('profileImage') : null;

    // Pass the user object to the view
    res.render('knowledge-base/entry', { entry, user: currentUser });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});



router.get('/:kbId/entries/:entryId/edit', ensureAuthenticated, async (req, res) => {
  try {
    const { kbId, entryId } = req.params;
    const entry = await KnowledgeBaseEntry.findById(entryId);

    if (!entry) {
      return res.status(404).send('Entry not found');
    }

    // Render the edit page with the entry data
    res.render('knowledge-base/edit-entry', { entry, kbId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


// Update entry route
router.put('/:kbId/entries/:entryId', ensureAuthenticated, async (req, res) => {
  try {
    const { kbId, entryId } = req.params;
    const { title, entryContent, tags } = req.body;
    const parsedTags = tags.split(',').map(tag => tag.trim());

    const entry = await KnowledgeBaseEntry.findByIdAndUpdate(entryId, {
      title,
      entryContent,
      tags: parsedTags,
    }, { new: true });

    if (!entry) {
      return res.status(404).send('Entry not found');
    }

    res.redirect(`/knowledge-base/${kbId}/entries/${entryId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Delete entry route
router.delete('/:kbId/entries/:entryId', ensureAuthenticated, async (req, res) => {
  try {
    const { kbId, entryId } = req.params;

    const entry = await KnowledgeBaseEntry.findByIdAndDelete(entryId);

    if (!entry) {
      return res.status(404).send('Entry not found');
    }

    res.redirect(`/knowledge-base/${kbId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});









// Export the router for use in the main app

module.exports = router;
