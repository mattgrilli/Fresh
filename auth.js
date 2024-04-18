function ensureAuthenticated(req, res, next) {
    console.log('Checking authentication...'); // Add this line
    if (req.isAuthenticated()) {
      // Check if the user is deleted
      if (req.user.isDeleted) {
        // Find snippets owned by the deleted user and set owner to null
        Snippet.updateMany({ owner: req.user._id }, { owner: null }, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Updated ${result.nModified} snippets with owner set to deleted user with ID ${req.user._id}`);
          }
        });
        // Log out the user
        req.logout();
        // Redirect to login with an error message
        req.flash('error_msg', 'This user account has been deleted.');
        res.redirect('/login');
        return;
      }
      return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
  }
  
  module.exports = {
    ensureAuthenticated,
  };
  