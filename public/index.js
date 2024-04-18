
const copyBtns = document.querySelectorAll('.copy-btn');

function copyToClipboard(text, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = 'Copy code';
        }, 2000);
      })
      .catch((error) => {
        console.error('Clipboard write failed:', error);
      });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      const success = document.execCommand('copy');
      if (success) {
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = 'Copy code';
        }, 2000);
      } else {
        console.error('Copy to clipboard using execCommand failed');
      }
    } catch (error) {
      console.error('Copy to clipboard using execCommand failed:', error);
    }
    document.body.removeChild(textArea);
  }
}

copyBtns.forEach((btn) => {
  const code = btn.parentElement.nextElementSibling.textContent;
  btn.addEventListener('click', () => {
    copyToClipboard(code, btn);
  });
});

function toggleCreateForm() {
  const createForm = document.getElementById('create-form-overlay');
  if (createForm.style.display === 'none' || !createForm.style.display) {
    createForm.style.display = 'block';
  } else {
    createForm.style.display = 'none';
  }
}

function toggleEditForm(id) {
  const overlay = document.getElementById(`overlay-${id}`);
  overlay.classList.toggle('show');
  const form = document.getElementById(`edit-form-${id}`);
  form.classList.toggle('show');
}


const tasksBtn = document.querySelector('.header-btn');
tasksBtn.addEventListener('click', () => {
  window.location.href = '/tasks';
});

function toggleUserOptions() {
  const userOptions = document.getElementById('user-options');
  userOptions.style.display = userOptions.style.display === 'none' ? 'block' : 'none';
}

function toggleDropdown(event) {
event.preventDefault();
const dropdown = document.querySelector('.dropdown-content');
dropdown.classList.toggle('show');
}


function confirmDelete(event, formId) {
event.preventDefault();
const confirmation = window.confirm('Deleting this snippet will be irreversible and permanent. Are you sure you want to delete it?');
if (confirmation) {
const deleteText = prompt('Type "delete" to confirm the deletion:');
if (deleteText.toLowerCase() === 'delete') {
  document.getElementById(formId).submit();
} else {
  alert('Deletion not confirmed. Please type "delete" to proceed.');
}
}
}



