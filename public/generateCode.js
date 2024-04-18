document.getElementById('generate-code-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await fetch('/admin/generate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
  
    const data = await response.json();
  
    if (data.success) {
      document.getElementById('generated-code').innerText = `Generated Code: ${data.code}`;
    } else {
      alert('Failed to generate code. Please try again.');
    }
  });
  