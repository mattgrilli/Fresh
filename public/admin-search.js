function searchUsers(keyword) {
    $('#userTable tbody tr').each(function() {
      const username = $(this).find('td:first-child').text().toLowerCase();
      const email = $(this).find('td:nth-child(2)').text().toLowerCase();
  
      if (username.includes(keyword) || email.includes(keyword)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }
  
  $('.search-bar button').click(function() {
    const keyword = $('.search-bar input').val().toLowerCase();
    searchUsers(keyword);
  });
  
  $('.search-bar input').keyup(function() {
    const keyword = $(this).val().toLowerCase();
    searchUsers(keyword);
  });
  