from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

#load env variables
load_dotenv()

app = Flask(__name__)
CORS(app) #Enable CORS for frontend requests

#Pesapal config
PESAPAL_CONSUMER_KEY = os.getenv('PESAPAL_CONSUMER_KEY')
PESAPAL_CONSUMER_SECRET = os.getenv('PESAPAL_CONSUMER_SECRET')
PESAPAL_BASE_URL = os.getenv('PESAPAL_BASE_URL',' https://cybqa.pesapal.com/pesapalv3')

#store the tokens in memory for now
cached_token = {
    'token': None,
    'expires_at': None
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {'status': 'ok',
         'message': 'Pesapal backend is running'
        }
    )

@app.route('/pesapal/token', methods=['POST'])
def get_pesapal_token():
    """Get OAuth token from pesapal"""
    try:
        response = requests.post(
            f'{PESAPAL_BASE_URL}/api/Auth/RequestToken',
            json={
                'consumer_key': PESAPAL_CONSUMER_KEY,
                'consumer_secret': PESAPAL_CONSUMER_SECRET
            },
            headers = {'Content-Type': 'application/json'}
        )

        if response.status_code == 200:
            data = response.json()
            cached_token['token'] = data.get('token')
            return jsonify({
                'success': True,
                'token': data.get('token')
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to get token'
            }), response.status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/pesapal/register-ipn', methods = ['POST'])
def register_ipn():
    """Register IPN URL with Pesapal"""
    try:
        data = request.json
        token = data.get('token')
        ipn_url = data.get('ipn_url')

        response = requests.post(

            f'{PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN',
            json={
                'url': ipn_url,
                'ipn_notification_type': 'GET'
            },
            headers={
                'Authorization': f'Bearer{token}',
                'Content-Type': 'application/json'
            }
        )

        if response.status_code == 200:
            return jsonify({
                'success': True,
                'data': response.json()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to register IPN',
                'details': response.text
            }), response.status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/pesapal/submit-order', methods=['POST'])
def submit_order():
    """Submit order to Pesapal"""
    try:
        data = request.json
        order = data.get('order')
        token = data.get('token')

        if not order or not token:
            return jsonify({
                'success': False,
                'error': 'Order and token are required'
            }), 400
        response = requests.post(
            f'{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest',
            json=order,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'redirect_url': result.get('redirect_url'),
                'order_tracking_id': result.get('order_tracking_id'),
                'merchant_reference': result.get('merchant_reference')
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to submit order',
                'details': response.text
            }), response.status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/pesapal/verify/<order_tracking_id>')
def verify_payment(order_tracking_id):
    """Verify payment status"""
    try:
        #Get fresh token
        token_response = requests.post(
            f'{PESAPAL_BASE_URL}/api/Auth/RequestToken',
            json = {
                'consumer_key': PESAPAL_CONSUMER_KEY,
                'consumer_secret': PESAPAL_CONSUMER_SECRET
            }
        )

        if token_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': 'Failed to get token for verification'
            }), 500
        token = token_response.json().get('token')

        #Get transaction status
        response = requests.get(
            f'{PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}',
            headers={
                'Authorization': f'Bearer{token}',
                'Content-Type': 'application/json'
            }
        )

        if response.status_code == 200:
            data = response.json()
            payment_status = data.get('payment_status_description', '').lower()

            #Pesapal status codes: Completed, Failed, Pending
            status = 'success' if payment_status == 'completed' else 'failed' if payment_status == 'failed' else 'pending'

            return jsonify({
                'success': True,
                'status': status,
                'payment_method': data.get('payment_method'),
                'amount': data.get('amount'),
                'currency': data.get('currency'),
                'payment_status_description': data.get('payment_status_description'),
                'merchant_reference': data.get('merchant_reference')
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to verify payment',
                'details': response.text
            }), response.status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/pesapal/ipn-callback', method=['GET'])
def ipn_callback():
    """Handle IPN callback from Pesapl"""
    try:
        order_tracking_id = request.args.get('OrderTrackingId')
        order_merchant_reference = request.args.get('OrderMerchantReference')

        if not order_tracking_id:
            return jsonify({
                'success': False,
                'error': 'OrderTrackingId is required'
            }), 400
        
        #verify payment status
        verification = verify_payment(order_tracking_id)

        #Update database with the payment status
        #send confirmation and email to custonmer
        #trigger order fulfilment

        print(f"IPN Received - Order : {order_merchant_reference}, Status: {verification}")

        return jsonify({
            'success': True,
            'message': 'IPN Processed'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    #check if credentials are set
    if not PESAPAL_CONSUMER_KEY or not PESAPAL_CONSUMER_SECRET:
        print("WARNING: Pesapal credentials not set!")
        print("Please set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in .env file")

    #run the server
    app.run(debug=True, host='0.0.0', port=5000)