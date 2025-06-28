// DOM elements
const principalInput = document.getElementById('principal');
const annualRateInput = document.getElementById('annual_rate');
const tenureQuartersInput = document.getElementById('tenure_quarters');
const principalSlider = document.getElementById('principalSlider');
const rateSlider = document.getElementById('rateSlider');
const tenureSlider = document.getElementById('tenureSlider');
const toggleYr = document.getElementById('toggleYr');
const toggleQtr = document.getElementById('toggleQtr');
const resultsSection = document.getElementById('resultsSection');

// Result elements
const quarterlyEmiElement = document.getElementById('quarterlyEmi');
const totalInterestElement = document.getElementById('totalInterest');
const totalPaymentElement = document.getElementById('totalPayment');
const principalAmountElement = document.getElementById('principalAmount');
const interestAmountElement = document.getElementById('interestAmount');

// Current tenure mode
let tenureMode = 'quarters'; // 'quarters' or 'years'

// Format number as Indian currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format number with Indian commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Parse number from formatted string
function parseFormattedNumber(str) {
    return parseFloat(str.replace(/[₹,\s]/g, '')) || 0;
}

// Format principal input
function formatPrincipalInput(value) {
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(num)) return '';
    
    if (num >= 10000000) { // 1 crore or more
        return (num / 10000000).toFixed(0) + ',00,00,000';
    } else if (num >= 100000) { // 1 lakh or more
        return (num / 100000).toFixed(0) + ',00,000';
    } else {
        return formatNumber(num);
    }
}

// Convert display value to actual number
function getActualPrincipal(displayValue) {
    // Remove formatting and convert to number
    const cleanValue = displayValue.replace(/[^\d.]/g, '');
    return parseFloat(cleanValue) || 0;
}

// Update slider position from input
function updateSliderFromInput() {
    // Principal slider
    const principalValue = getActualPrincipal(principalInput.value);
    if (principalValue >= principalSlider.min && principalValue <= principalSlider.max) {
        principalSlider.value = principalValue;
    }
    
    // Rate slider
    const rateValue = parseFloat(annualRateInput.value);
    if (!isNaN(rateValue) && rateValue >= rateSlider.min && rateValue <= rateSlider.max) {
        rateSlider.value = rateValue;
    }
    
    // Tenure slider
    const tenureValue = parseInt(tenureQuartersInput.value);
    if (!isNaN(tenureValue) && tenureValue >= tenureSlider.min && tenureValue <= tenureSlider.max) {
        tenureSlider.value = tenureValue;
    }
}

// Update input from slider
function updateInputFromSlider() {
    // Principal input
    const principalValue = parseInt(principalSlider.value);
    principalInput.value = formatPrincipalInput(principalValue.toString());
    
    // Rate input
    annualRateInput.value = parseFloat(rateSlider.value).toFixed(1);
    
    // Tenure input
    if (tenureMode === 'quarters') {
        tenureQuartersInput.value = tenureSlider.value;
    } else {
        const years = Math.round(tenureSlider.value / 4);
        tenureQuartersInput.value = years;
    }
}

// Toggle between years and quarters
function setTenureMode(mode) {
    tenureMode = mode;
    
    if (mode === 'years') {
        toggleYr.classList.add('active');
        toggleQtr.classList.remove('active');
        
        // Convert current quarters to years
        const currentQuarters = parseInt(tenureQuartersInput.value) || 20;
        const years = Math.round(currentQuarters / 4);
        tenureQuartersInput.value = years;
        
        // Update slider for years (max 30 years = 120 quarters)
        tenureSlider.max = 30;
        tenureSlider.value = years;
        
        // Update scale labels for years
        updateTenureScale('years');
        
    } else {
        toggleQtr.classList.add('active');
        toggleYr.classList.remove('active');
        
        // Convert current years to quarters
        const currentYears = parseInt(tenureQuartersInput.value) || 5;
        const quarters = currentYears * 4;
        tenureQuartersInput.value = quarters;
        
        // Update slider for quarters
        tenureSlider.max = 120;
        tenureSlider.value = quarters;
        
        // Update scale labels for quarters
        updateTenureScale('quarters');
    }
    
    calculateEMI();
}

// Update tenure scale labels
function updateTenureScale(mode) {
    const scaleContainer = tenureSlider.parentElement.querySelector('.slider-scale');
    
    if (mode === 'years') {
        scaleContainer.innerHTML = `
            <span class="scale-point">0</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">5</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">10</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">15</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">20</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">25</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">30</span>
        `;
    } else {
        scaleContainer.innerHTML = `
            <span class="scale-point">0</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">20</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">40</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">60</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">80</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">100</span>
            <span class="scale-mark">|</span>
            <span class="scale-point">120</span>
        `;
    }
}

// Calculate quarterly EMI
function calculateEMI() {
    try {
        const principal = getActualPrincipal(principalInput.value);
        const annualRate = parseFloat(annualRateInput.value);
        let tenureQuarters;
        
        if (tenureMode === 'years') {
            const years = parseInt(tenureQuartersInput.value);
            tenureQuarters = years * 4;
        } else {
            tenureQuarters = parseInt(tenureQuartersInput.value);
        }
        
        if (!principal || principal <= 0 || !annualRate || annualRate < 0 || !tenureQuarters || tenureQuarters <= 0) {
            return;
        }
        
        // Calculate quarterly EMI
        const quarterlyRate = annualRate / 4 / 100;
        let quarterlyEmi;
        
        if (quarterlyRate === 0) {
            quarterlyEmi = principal / tenureQuarters;
        } else {
            quarterlyEmi = (principal * quarterlyRate * Math.pow(1 + quarterlyRate, tenureQuarters)) / 
                          (Math.pow(1 + quarterlyRate, tenureQuarters) - 1);
        }
        
        const totalPayment = quarterlyEmi * tenureQuarters;
        const totalInterest = totalPayment - principal;
        
        // Update results
        quarterlyEmiElement.textContent = formatCurrency(quarterlyEmi);
        totalInterestElement.textContent = formatCurrency(totalInterest);
        totalPaymentElement.textContent = formatCurrency(totalPayment);
        principalAmountElement.textContent = formatNumber(principal);
        interestAmountElement.textContent = formatNumber(totalInterest);
        
        // Draw pie chart
        drawPieChart(principal, totalInterest);
        
    } catch (error) {
        console.error('Calculation error:', error);
    }
}

// Draw simple pie chart
function drawPieChart(principal, interest) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (principal === 0 && interest === 0) return;
    
    const total = principal + interest;
    const principalAngle = (principal / total) * 2 * Math.PI;
    
    // Draw principal slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, principalAngle);
    ctx.closePath();
    ctx.fillStyle = '#28a745';
    ctx.fill();
    
    // Draw interest slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, principalAngle, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#ff6b35';
    ctx.fill();
    
    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Event listeners
principalInput.addEventListener('blur', () => {
    const value = getActualPrincipal(principalInput.value);
    if (value > 0) {
        principalInput.value = formatPrincipalInput(value.toString());
    }
    updateSliderFromInput();
    calculateEMI();
});

principalInput.addEventListener('input', () => {
    // Allow typing without immediate formatting
    updateSliderFromInput();
    calculateEMI();
});

annualRateInput.addEventListener('input', () => {
    // Validate rate input
    let value = annualRateInput.value.replace(/[^\d.]/g, '');
    if (parseFloat(value) > 20) value = '20';
    annualRateInput.value = value;
    
    updateSliderFromInput();
    calculateEMI();
});

tenureQuartersInput.addEventListener('input', () => {
    // Validate tenure input
    let value = tenureQuartersInput.value.replace(/[^\d]/g, '');
    const maxValue = tenureMode === 'years' ? 30 : 120;
    if (parseInt(value) > maxValue) value = maxValue.toString();
    tenureQuartersInput.value = value;
    
    updateSliderFromInput();
    calculateEMI();
});

// Slider event listeners
principalSlider.addEventListener('input', () => {
    updateInputFromSlider();
    calculateEMI();
});

rateSlider.addEventListener('input', () => {
    updateInputFromSlider();
    calculateEMI();
});

tenureSlider.addEventListener('input', () => {
    updateInputFromSlider();
    calculateEMI();
});

// Toggle button event listeners
toggleYr.addEventListener('click', () => setTenureMode('years'));
toggleQtr.addEventListener('click', () => setTenureMode('quarters'));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial values
    principalInput.value = '50,00,000';
    annualRateInput.value = '9';
    tenureQuartersInput.value = '20';
    
    // Initialize sliders
    principalSlider.value = '5000000';
    rateSlider.value = '9';
    tenureSlider.value = '20';
    
    // Set initial mode
    setTenureMode('quarters');
    
    // Initial calculation
    calculateEMI();
}); 