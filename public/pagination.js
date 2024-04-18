let rowsPerPage = 10;
let currentPage = 1;
let totalPages;

function createPaginationButtons(totalPages) {
  const container = $('#pagination-container');

  const first = $('<button data-page="first">&lt;&lt;</button>');
  const prev = $('<button data-page="prev">&lt;</button>');
  const next = $('<button data-page="next">&gt;</button>');
  const last = $('<button data-page="last">&gt;&gt;</button>');

  container.append(first, prev);

  for (let i = 1; i <= totalPages; i++) {
    const button = $('<button data-page="' + i + '">' + i + '</button>');
    container.append(button);
  }

  container.append(next, last);

  container.on('click', 'button', handlePaginationButtonClick);
}

function updatePaginationButtons() {
  $('.pagination button[data-page]').attr('disabled', false);

  if (currentPage === 1) {
    $('.pagination button[data-page="first"], .pagination button[data-page="prev"]').attr('disabled', true);
  }

  if (currentPage === totalPages) {
    $('.pagination button[data-page="next"], .pagination button[data-page="last"]').attr('disabled', true);
  }
}

function updateResultsInfo() {
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, $('#userTable tbody tr').length);
  const total = $('#userTable tbody tr').length;

  $('#results-info').text('Showing ' + start + ' - ' + end + ' of ' + total + ' users');
}

function handlePaginationButtonClick() {
  const page = $(this).data('page');

  if (page === 'first') {
    currentPage = 1;
  } else if (page === 'prev') {
    currentPage = Math.max(currentPage - 1, 1);
  } else if (page === 'next') {
    currentPage = Math.min(currentPage + 1, totalPages);
  } else if (page === 'last') {
    currentPage = totalPages;
  } else {
    currentPage = parseInt(page, 10);
  }

  paginate();
  updatePaginationButtons();
  updateResultsInfo();
  updateResultsInfo();
}

function paginate() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  $('#userTable tbody tr').each(function(index) {
    if (index >= start && index < end) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

function setTotalPages() {
  totalPages = Math.ceil($('#userTable tbody tr').length / rowsPerPage);
}

window.pagination = {
  createPaginationButtons,
  paginate,
  updatePaginationButtons,
  updateResultsInfo,
  setTotalPages
};

$(document).ready(function() {
  setTotalPages();
  createPaginationButtons(totalPages);
  paginate();
  updatePaginationButtons();
  updateResultsInfo();
});

      