document.addEventListener('DOMContentLoaded', () => {
  // Function to toggle password visibility
  const showPasswordCheckbox = document.getElementById('showPassword');
  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', function() {
      const passwordField = document.getElementById('password');
      const confirmPasswordField = document.getElementById('confirmPassword');

      if (this.checked) {
        passwordField.type = 'text';  // Show the password
        confirmPasswordField.type = 'text';  // Show confirm password
      } else {
        passwordField.type = 'password';  // Hide the password
        confirmPasswordField.type = 'password';  // Hide confirm password
      }
    });
  }

  // Function to navigate to About Us section
  function navigatePage() {
    const aboutUsSection = document.getElementById('about-us');
    if (aboutUsSection) {
      aboutUsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // Adding event listener to Learn More button
  const learnMoreButton = document.getElementById('learn-more');
  if (learnMoreButton) {
    learnMoreButton.addEventListener('click', navigatePage);
  }

  // Handle the signup form submission
  function handleSignupForm(event) {
    event.preventDefault(); // Prevent form from submitting normally
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation for passwords match
    if (password !== confirmPassword) {
      document.getElementById('error-message').innerText = "Passwords do not match!";
      return false;
    }

    // Log form data or send to server
    console.log(username, email, password);
    return true;
  }

});
document.querySelectorAll('.faq-question').forEach(item => {
  item.addEventListener('click', () => {
      const answer = item.nextElementSibling;
      answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
  });
});




// // Run function on page load
// document.addEventListener('DOMContentLoaded', fetchPrediction);
async function fetchPrediction() {
  const tbody = document.getElementById('report-table').querySelector('tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading predictions...</td></tr>';
  try {
      let response = await fetch('http://127.0.0.1:5000/get_daily_prediction');
      let data = await response.json();

      let peakResponse = await fetch('http://127.0.0.1:5000/get_peak_prediction');
      let peakData = await peakResponse.json();

      if (data.demand === "No data available" || peakData.peak_load === "No data available") {
          tbody.innerHTML = '<tr><td colspan="4">No prediction data available</td></tr>';
          return;
      }

      tbody.innerHTML = `
          <tr>
              <td>${data.timestamp}</td>
              <td>Electricity Demand</td>
              <td>${data.demand} MU</td>
              <td>Daily forecast from ARIMA model</td>
          </tr>
          <tr>
              <td>${peakData.timestamp}</td>
              <td>Peak Load</td>
              <td>${peakData.peak_load} MU</td>
              <td>Daily peak load forecast from ARIMA model</td>
          </tr>
      `;
  } catch (error) {
      console.error("Error fetching prediction:", error);
      tbody.innerHTML = '<tr><td colspan="4">Error loading predictions</td></tr>';
  }
}

// Call function on page load
document.addEventListener('DOMContentLoaded', fetchPrediction);
