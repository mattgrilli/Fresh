const searchBox = document.getElementById('search-input');
const snippetsList = document.getElementById('snippets-list');
const searchResultsContainer = document.querySelector('.search-results-container');
const searchResultsList = document.getElementById('search-results-list');

searchBox.addEventListener('input', (event) => {
  const searchValue = event.target.value.toLowerCase();
  const snippets = snippetsList.getElementsByTagName('li');
  const searchResults = [];
  for (let i = 0; i < snippets.length; i++) {
    const snippetName = snippets[i].getElementsByTagName('h2')[0].textContent.toLowerCase();
    const snippetDescription = snippets[i].getElementsByClassName('snippet-description')[0].textContent.toLowerCase();
    const snippetCode = snippets[i].getElementsByClassName('code-box')[0].textContent.toLowerCase();
    if (snippetName.indexOf(searchValue) > -1 || snippetDescription.indexOf(searchValue) > -1 || snippetCode.indexOf(searchValue) > -1) {
      snippets[i].style.display = '';
      searchResults.push(snippets[i]);
    } else {
      snippets[i].style.display = 'none';
    }
  }

  if (searchValue.length > 0 && searchResults.length > 0) {
    searchResultsList.innerHTML = '';

    searchResults.forEach((result) => {
      const resultName = result.getElementsByTagName('h2')[0].textContent;
      const resultLink = document.createElement('a');
      resultLink.setAttribute('href', `#${result.id}`);
      resultLink.innerHTML = resultName;

      const resultItem = document.createElement('li');
      resultItem.appendChild(resultLink);
      searchResultsList.appendChild(resultItem);

      resultLink.addEventListener('click', (event) => {
        event.preventDefault();
        searchBox.value = resultName;
        searchBox.dispatchEvent(new Event('input'));
      });
    });

    const resultCount = document.createElement('p');
    resultCount.innerHTML = `Showing ${searchResults.length} results`;
    resultCount.classList.add('search-results-count');
    searchResultsContainer.appendChild(resultCount);

    searchResultsContainer.style.display = 'block';
  } else {
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none';
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('#search-input, #clear-button, #options-button, .search-option')) {
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none';
    searchBox.value = '';
  }
});

const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', () => {
  searchBox.value = '';
  searchBox.dispatchEvent(new Event('input'));
});

const optionsButton = document.getElementById('options-button');
optionsButton.addEventListener('click', () => {
  const searchOptionsForm = document.createElement('form');
  searchOptionsForm.classList.add('search-options-form');

  const fieldsLabel = document.createElement('label');
  fieldsLabel.innerHTML = 'Search Fields:';
  fieldsLabel.setAttribute('for', 'fields-select');
  searchOptionsForm.appendChild(fieldsLabel);

  const fieldsSelect = document.createElement('select');
  fieldsSelect.setAttribute('name', 'fields');
  fieldsSelect.setAttribute('id', 'fields-select');
  fieldsSelect.setAttribute('multiple', '');
  searchOptionsForm.appendChild(fieldsSelect);

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.innerHTML = 'All';
  allOption.selected = true;
  fieldsSelect.appendChild(allOption);

  const nameOption = document.createElement('option');
  nameOption.value = 'name';
  nameOption.innerHTML = 'Name';
  fieldsSelect.appendChild(nameOption);

  const descriptionOption = document.createElement('
