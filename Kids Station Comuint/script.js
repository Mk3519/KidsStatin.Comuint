// Google Apps Script deployed URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwbD1oOihDepwT8Y2KzFHVTtbU1FfOMB6Ys-vZPVenilZVH_fNf0GdcUOH2qrzUFpOw/exec';

document.getElementById('commentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const comment = document.getElementById('comment').value;
    const messageDiv = document.getElementById('message');
    
    // Create timestamp
    const timestamp = new Date().toLocaleString();
    
    // Prepare the data
    const data = {
        timestamp: timestamp,
        name: name,
        email: email,
        comment: comment
    };
    
    // Send data to Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        // Show success message
        messageDiv.textContent = 'تم إرسال تعليقك بنجاح!';
        messageDiv.className = 'message success';
        
        // Clear the form
        document.getElementById('commentForm').reset();
        
        // Hide the message after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    })
    .catch(error => {
        // Show error message
        messageDiv.textContent = 'حدث خطأ أثناء إرسال تعليقك. يرجى المحاولة مرة أخرى.';
        messageDiv.className = 'message error';
        console.error('Error:', error);
    });
});
