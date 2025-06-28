from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

def calculate_quarterly_emi(principal, annual_rate, tenure_quarters):
    """
    Calculate Quarterly EMI
    Formula: EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
    Where:
    P = Principal loan amount
    r = Quarterly interest rate (annual rate / 4 / 100)
    n = Number of quarterly payments (tenure_quarters)
    """
    try:
        # Convert annual rate to quarterly rate
        quarterly_rate = annual_rate / 4 / 100
        
        # Number of quarters is already provided
        num_quarters = int(tenure_quarters)
        
        if quarterly_rate == 0:
            # If interest rate is 0, EMI is simply principal divided by number of quarters
            quarterly_emi = principal / num_quarters
        else:
            # EMI calculation formula
            quarterly_emi = (principal * quarterly_rate * math.pow(1 + quarterly_rate, num_quarters)) / (math.pow(1 + quarterly_rate, num_quarters) - 1)
        
        # Calculate total payment and total interest
        total_payment = quarterly_emi * num_quarters
        total_interest = total_payment - principal
        
        return {
            'quarterly_emi': round(quarterly_emi, 2),
            'total_payment': round(total_payment, 2),
            'total_interest': round(total_interest, 2),
            'num_quarters': num_quarters
        }
    except Exception as e:
        return None

@app.route('/')
def home():
    return render_template('quarterly-emi-calculator.html')

@app.route('/quarterly-emi-calculator/')
def quarterly_emi_calculator():
    return render_template('quarterly-emi-calculator.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        principal = float(data['principal'])
        annual_rate = float(data['annual_rate'])
        
        # Handle both tenure_quarters (new) and tenure_years (old) for backward compatibility
        if 'tenure_quarters' in data:
            tenure_quarters = int(data['tenure_quarters'])
        elif 'tenure_years' in data:
            # Convert years to quarters for backward compatibility
            tenure_quarters = int(float(data['tenure_years']) * 4)
        else:
            return jsonify({'error': 'Please provide tenure_quarters'}), 400
        
        # Validation
        if principal <= 0:
            return jsonify({'error': 'Loan amount must be greater than 0'}), 400
        
        if principal < 1000:
            return jsonify({'error': 'Minimum loan amount should be ₹1,000'}), 400
            
        if annual_rate < 0:
            return jsonify({'error': 'Interest rate cannot be negative'}), 400
            
        if annual_rate > 50:
            return jsonify({'error': 'Interest rate seems too high (maximum 50%)'}), 400
        
        if tenure_quarters <= 0:
            return jsonify({'error': 'Loan tenure must be greater than 0 quarters'}), 400
            
        if tenure_quarters > 400:
            return jsonify({'error': 'Maximum loan tenure is 400 quarters (100 years)'}), 400
        
        result = calculate_quarterly_emi(principal, annual_rate, tenure_quarters)
        
        if result is None:
            return jsonify({'error': 'Error in calculation'}), 400
        
        return jsonify(result)
    
    except (ValueError, KeyError) as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port) 