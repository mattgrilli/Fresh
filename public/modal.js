$('tr[data-id]').click(function() {
    const userId = $(this).data('id');
    $('#user-id').val(userId);
    $('#user-actions-modal').show();
  });
  
  $('.close').click(function() {
    $('#user-actions-modal').hide();
  });
  
  $(window).click(function(event) {
    if (event.target == document.getElementById('user-actions-modal')) {
      $('#user-actions-modal').hide();
    }
  });
  
  $('#reset-password').click(function() {
    const userId = $('#user-id').val();
    console.log('Reset password for user ID: ' + userId);
    // TODO: Implement password reset logic
  });
  
  $('#force-logout').click(function() {
    const userId = $('#user-id').val();
    console.log('Force logout for user ID: ' + userId);
    // TODO: Implement force logout logic
  });
  
  $('#update-role').click(function() {
    const userId = $('#user-id').val();
    const newRole = $('#new-role').val();
    console.log('Update role for user ID: ' + userId + ', new role: ' + newRole);
    // TODO: Implement role update logic
  });
  