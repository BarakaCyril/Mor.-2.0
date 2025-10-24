from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import uuid

#load env variables
load_dotenv()

app = Flask(__name__)
CORS(app) #Enable CORS for frontend requests

#Pesapal config
PESAPAL_CONSUMER_KEY = os.getenv('PESAPAL_CONSUMER_KEY')
PESAPAL_CONSUMER_SECRET = os.getenv('PESAPAL_CONSUMER_SECRET')
PESAPAL_BASE_URL = os.getenv('PESAPAL_BASE_URL', 'https://cybqa.pesapal.com/pesapalv3')

# # Debug log credentials (mask most of the characters)
# if PESAPAL_CONSUMER_KEY:
#     masked_key = PESAPAL_CONSUMER_KEY[:4] + '*' * (len(PESAPAL_CONSUMER_KEY) - 4)
#     print(f"Consumer Key loaded: {masked_key}")
# else:
#     print("WARNING: PESAPAL_CONSUMER_KEY not found in environment variables")

# if PESAPAL_CONSUMER_SECRET:
#     masked_secret = PESAPAL_CONSUMER_SECRET[:4] + '*' * (len(PESAPAL_CONSUMER_SECRET) - 4)
#     print(f"Consumer Secret loaded: {masked_secret}")
# else:
#     print("WARNING: PESAPAL_CONSUMER_SECRET not found in environment variables")

#store the tokens in memory for now
cached_token = {
    'token': None,
    'expires_at': None
}

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Welcome to Mor backend',
        'status': 'active',
        'version': '1.0'
    })


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
            print("Pesapal token response:", data)  # Debug log
            token = data.get('token')
            cached_token['token'] = token
            
            if not token:
                return jsonify({
                    'success': False,
                    'error': 'No token received from Pesapal'
                }), 400
                
            return jsonify({
                'success': True,
                'token': token
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

        if not token or not ipn_url:
            return jsonify({
                'success': False,
                'error': 'token and IPN url are required'
            }), 400

        response = requests.post(
            f'{PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN',
            json={
                'url': ipn_url,
                'ipn_notification_type': 'GET'
            },
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )

        print("IPN Registration Response:", response.text)

        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'ipn_id': result.get('ipn_id'),
                'url': result.get('url')
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to register IPN',
                'details': response.text
            }), response.status_code
    except Exception as e:
        print('IPN REGISTRATION ERROR:', str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/pesapal/submit-order', methods=['POST'])
def submit_order():
    """Submit order to Pesapal"""
    try:
        data = request.json
        print("Received data:", data)  # Debug log
        order = data.get('order')
        token = data.get('token')
        print("Order:", order)  # Debug log
        print("Token:", token)  # Debug log

        if not order or not token:
            return jsonify({
                'success': False,
                'error': 'Order and token are required'
            }), 400
        print("Submitting order to Pesapal with data:", order)
        print("Using URL:", f'{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest')

        # Ensure merchant_reference is present and valid
        if not order.get('id'):
            return jsonify({
                'success': False,
                'error': 'Merchant reference is required TYPE SHI'
            }), 400

        # Prepare the request payload according to Pesapal's exact specification
        notification_id = order.get('notification_id') or str(uuid.uuid4())

        payload = {
            "id": str(order['id']),  # Using 'id' instead of 'merchant_reference'
            "currency": order['currency'],
            "amount": float(order['amount']),
            "description": order['description'],
            "callback_url": order['callback_url'],
            "notification_id": order['notification_id'],
            "billing_address": {
                "email_address": order['billing_address']['email_address'],
                "phone_number": order['billing_address']['phone_number'],
                "country_code": order['billing_address']['country_code'],
                "first_name": order['billing_address']['first_name'],
                "middle_name": order['billing_address']['middle_name'],
                "last_name": order['billing_address']['last_name'],
                "line_1": order['billing_address']['line_1'],
                "line_2": order['billing_address']['line_2'],
                "city": order['billing_address']['city'],
                "state": order['billing_address']['state'],
                "postal_code": order['billing_address']['postal_code'],
                "zip_code": order['billing_address']['zip_code']
            }
        }
        
        print("Final payload to Pesapal:", payload)
        
        response = requests.post(
            f'{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest',
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )
        print("Pesapal response status:", response.status_code)
        print("Pesapal response body:", response.text)
        
        if response.status_code == 200:
            result = response.json()
            print("Parsed response:", result)
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

@app.route('/pesapal/ipn-callback', methods=['GET'])
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
    app.run(debug=True, host='0.0.0.0', port=5000)