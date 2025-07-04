# Quarterly EMI Calculator

A modern, responsive web application for calculating quarterly EMI (Equated Monthly Installment) payments built with Python Flask, HTML, CSS, and JavaScript.

## Features
- Quarterly EMI calculation with precise formula
- Real-time input validation
- Responsive design for all devices
- Auto-calculation as you type
- Detailed payment breakdown
- Print functionality
- Modern UI with smooth animations

## Setup Instructions

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   python app.py
   ```

3. **Open browser and visit**:
   ```
   http://localhost:5000/quarterly-emi-calculator/
   ```

## Usage
1. Enter loan amount, annual interest rate, and tenure in years
2. Click "Calculate Quarterly EMI" or press Ctrl+Enter
3. View detailed results including EMI, total interest, and payment breakdown

## Formula
```
EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
```
Where P = Principal, r = Quarterly rate, n = Number of quarters

Built with ❤️ using Python Flask
