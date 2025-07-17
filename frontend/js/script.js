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



// // Demand Chart
// new Chart(demandCtx, {
//   type: "line",
//   data: {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//     datasets: [
//       {
//         label: "Electricity Demand (MW)",
//         data: [120, 130, 150, 170, 200, 220, 240, 210, 180, 160, 140, 130],
//         borderColor: "#007bff",
//         fill: true,
//         backgroundColor: "rgba(0, 123, 255, 0.3)",
//       },
//     ],
//   },
// });

// // Peak Load Chart
// new Chart(peakLoadCtx, {
//   type: "bar",
//   data: {
//     labels: ["Region A", "Region B", "Region C", "Region D"],
//     datasets: [
//       {
//         label: "Peak Load (MW)",
//         data: [500, 700, 600, 400],
//         backgroundColor: ["#ff5733", "#33ff57", "#3357ff", "#ff33a6"],
//       },
//     ],
//   },
// });

// // Forecast Chart
// new Chart(forecastCtx, {
//   type: "line",
//   data: {
//     labels: ["2021", "2022", "2023", "2024", "2025"],
//     datasets: [
//       {
//         label: "Forecast Demand (MW)",
//         data: [100, 150, 200, 250, 300],
//         borderColor: "#28a745",
//         fill: false,
//       },
//     ],
//   },
// });

// // Regional Load Distribution
// new Chart(regionalLoadCtx, {
//   type: "pie",
//   data: {
//     labels: ["North", "South", "East", "West"],
//     datasets: [
//       {
//         label: "Regional Load (%)",
//         data: [25, 35, 20, 20],
//         backgroundColor: ["#007bff", "#ffc107", "#dc3545", "#28a745"],
//       },
//     ],
//   },
// });
//for generating Reports
// function generateReport() {
//   const reportType = document.getElementById('report-type').value;
//   const timePeriod = document.getElementById('time-period').value;

//   const reportData = [
//       { time: '01/25/2025', type: 'Demand Forecast', value: '120 MW', details: 'Steady increase due to industrial usage.' },
//       { time: '01/26/2025', type: 'Peak Load Prediction', value: '150 MW', details: 'Expected during evening hours.' },
//   ];

//   const tableBody = document.getElementById('report-table').querySelector('tbody');
//   tableBody.innerHTML = '';

//   reportData.forEach(item => {
//       const row = document.createElement('tr');
//       row.innerHTML = `
//           <td>${item.time}</td>
//           <td>${item.type}</td>
//           <td>${item.value}</td>
//           <td>${item.details}</td>
//       `;
//       tableBody.appendChild(row);
//   });
// }
// async function fetchPrediction() {
//   try {
//       const response = await fetch('http://127.0.0.1:5000/get_daily_prediction');
//       if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("Fetched Prediction:", data); // Debugging: Log data to console

//       // Update report table only if data is available
//       let demandText = (data.demand !== "No data available") ? `${data.demand} kW` : "No prediction available";

//       document.getElementById('report-table').querySelector('tbody').innerHTML = `
//           <tr>
//               <td>${data.timestamp}</td>
//               <td>Electricity Demand</td>
//               <td>${demandText}</td>
//               <td>Daily forecast from ARIMA model</td>
//           </tr>
//       `;
//   } catch (error) {
//       console.error("Error fetching prediction:", error);
//       document.getElementById('report-table').querySelector('tbody').innerHTML = `
//           <tr>
//               <td colspan="4">Error fetching prediction.</td>
//           </tr>
//       `;
//   }
// }

// // Run function on page load
// document.addEventListener('DOMContentLoaded', fetchPrediction);
async function fetchPrediction() {
  try {
      let response = await fetch('http://127.0.0.1:5000/get_daily_prediction');
      let data = await response.json();
      
      document.getElementById('report-table').querySelector('tbody').innerHTML = `
          <tr>
              <td>${data.timestamp}</td>
              <td>Electricity Demand</td>
              <td>${data.demand} MU</td>
              <td>Daily forecast from ARIMA model</td>
          </tr>
      `;
  } catch (error) {
      console.error("Error fetching prediction:", error);
  }
}

// Call function on page load
document.addEventListener('DOMContentLoaded', fetchPrediction);
