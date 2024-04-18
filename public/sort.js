function sortTable(n, dir) {
    const table = document.getElementById("userTable");
    let rows, switching, i, x, y, shouldSwitch, switchcount = 0;
    switching = true;
  
    while (switching) {
      switching = false;
      rows = table.rows;
  
      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
  
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
  
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }
  
  $('th').click(function() {
    $('th .sort-indicator').html('&#x25B2;');
  
    const index = $(this).index();
    const currentDir = $(this).attr('data-sort-dir') === 'asc' ? 'desc' : 'asc';
  
    $(this).attr('data-sort-dir', currentDir);
    $(this).find('.sort-indicator').html(currentDir === 'asc' ? '&#x25BC;' : '&#x25B2;');
  
    sortTable(index, currentDir);
  });
  