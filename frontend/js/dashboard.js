// Global chart reference
let forecastChart;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    loadDashboardData();
    
    // Set up event listeners
    document.getElementById('refreshForecast').addEventListener('click', refreshForecast);
    document.getElementById('chartType').addEventListener('change', updateChartType);
    document.getElementById('exportChart').addEventListener('click', exportChart);
    
    // Set up auto-refresh every 5 minutes
    setInterval(loadDashboardData, 300000);
});

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Update last updated time
        document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleString()}`;
        
        // Load today's forecast
        await loadTodayForecast();
        
        // Load last 7 forecasts and update chart
        await loadLast7Forecasts();

        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data. Please try again.');
    }
}

// Load today's forecast
async function loadTodayForecast() {
    const forecastElement = document.getElementById('todayForecast');
    forecastElement.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch('http://localhost:5000/get_daily_prediction');
        const data = await response.json();
        
        if (data.demand === "No data available") {
            forecastElement.textContent = 'No forecast available for today';
            return;
        }
        
        forecastElement.innerHTML = `
            <span class="forecast-number">${data.demand}</span>
            <span class="forecast-unit">MU</span>
        `;
    } catch (error) {
        console.error('Error loading today\'s forecast:', error);
        forecastElement.textContent = 'Error loading forecast';
    }
}
// Load last 7 forecasts and update chart
async function loadLast7Forecasts() {
    try {
        const response = await fetch('http://localhost:5000/get_last_7_forecasts');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load forecast data');
        }
        
        // Update statistics
        updateStatistics({
            average: data.statistics.average,
            high: data.statistics.high,
            low: data.statistics.low,
            trend: data.statistics.trend,
            forecasts: data.forecasts
        });
        
        // Update chart
        updateChart(data.forecasts);
        
    } catch (error) {
        console.error('Error loading last 7 forecasts:', error);
        showError('Failed to load forecast data. Please try again.');
    }
}

function updateStatistics(stats) {
    document.getElementById('avgDemand').textContent = stats.average;
    document.getElementById('highDemand').textContent = stats.high;
    document.getElementById('lowDemand').textContent = stats.low;

    const trendElement = document.getElementById('demandTrend');
    if (stats.trend === 'rising') {
        trendElement.innerHTML = `<i class="fas fa-arrow-up" style="color: var(--danger-color)"></i> Rising`;
    } else if (stats.trend === 'falling') {
        trendElement.innerHTML = `<i class="fas fa-arrow-down" style="color: var(--success-color)"></i> Falling`;
    } else {
        trendElement.innerHTML = `<i class="fas fa-arrows-alt-h" style="color: var(--warning-color)"></i> Stable`;
    }
}


// Update or create the chart
function updateChart(forecasts) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Check if forecasts array is valid
    if (!forecasts || forecasts.length === 0) {
        ctx.canvas.parentNode.innerHTML = '<p>No forecast data available for the last 7 days</p>';
        return;
    }

    const dates = forecasts.map(f => f.date);
    const demands = forecasts.map(f => Number(f.demand)); // Ensure demand is a number
    
    // Validate data
    if (demands.some(isNaN)) {
        ctx.canvas.parentNode.innerHTML = '<p>Invalid forecast data</p>';
        return;
    }

    // Destroy previous chart if it exists
    if (forecastChart) {
        forecastChart.destroy();
    }
    
    // Get selected chart type
    const chartType = document.getElementById('chartType').value;
    
    forecastChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: dates,
            datasets: [{
                label: 'Energy Demand (MU)',
                data: demands,
                backgroundColor: chartType === 'bar' ? 
                    'rgba(67, 97, 238, 0.7)' : 'rgba(67, 97, 238, 1)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Energy Demand (MU)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Demand: ${context.parsed.y} MU`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Refresh forecast data
async function refreshForecast() {
    try {
        // Show loading state
        const refreshBtn = document.getElementById('refreshForecast');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        // Call refresh API
        const response = await fetch('http://localhost:5000/api/refresh_forecast', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to refresh forecast');
        }
        
        // Reload all data
        await loadDashboardData();
        
        // Show success message
        showToast('Forecast refreshed successfully!', 'success');
        
    } catch (error) {
        console.error('Error refreshing forecast:', error);
        showToast('Failed to refresh forecast', 'error');
    } finally {
        // Reset button state
        const refreshBtn = document.getElementById('refreshForecast');
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }
}

// Update chart type
function updateChartType() {
    if (forecastChart) {
        forecastChart.config.type = this.value;
        forecastChart.update();
    }
}

// Export chart as PNG
function exportChart() {
    if (forecastChart) {
        const link = document.createElement('a');
        link.download = 'energy-demand-forecast.png';
        link.href = forecastChart.toBase64Image();
        link.click();
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Show error message
function showError(message) {
    showToast(message, 'error');
}