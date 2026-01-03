document.getElementById("whatsappForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    const eventType = document.getElementById("event").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const budget = document.getElementById("budget").value;
    const message = document.getElementById("message").value;

    // Send data to server
    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone,
            event: eventType,
            location,
            date,
            budget,
            message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you! Your message has been sent to our admin.');
            // Clear form
            document.getElementById("whatsappForm").reset();
        } else {
            alert('Error sending message. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending message. Please try again.');
    });
});