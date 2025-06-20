from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
from marketing_genius_tool import MarketingGeniusTool
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json
import paypalrestsdk
from flask_mail import Mail, Message
import threading
import requests
from functools import wraps
import secrets
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS to only allow requests from your Netlify domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://geniusmarketingai.netlify.app",
            "http://localhost:3000"  # For local development
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://www.paypal.com https://www.paypalobjects.com; frame-src 'self' https://www.paypal.com; style-src 'self' 'unsafe-inline';"
    return response

# Initialize PayPal with proper error handling
try:
    paypalrestsdk.configure({
        "mode": os.getenv('PAYPAL_MODE', 'sandbox'),  # sandbox or live
        "client_id": os.getenv('PAYPAL_CLIENT_ID', 'your_client_id'),
        "client_secret": os.getenv('PAYPAL_CLIENT_SECRET', 'your_client_secret')
    })
except Exception as e:
    print(f"Error initializing PayPal: {e}")

# Initialize Flask-Mail with proper error handling
try:
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    mail = Mail(app)
except Exception as e:
    print(f"Error initializing Flask-Mail: {e}")
    mail = None

# Initialize Marketing Genius Tool
try:
    tool = MarketingGeniusTool()
except Exception as e:
    print(f"Error initializing Marketing Genius Tool: {e}")
    tool = None

# Simple in-memory storage for subscriptions (replace with database in production)
subscriptions = {}

def send_email_async(app, msg):
    """Send email asynchronously."""
    with app.app_context():
        try:
            if mail:
                mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

def send_email(email, subject, template):
    """Send email using Flask-Mail"""
    if not mail:
        return
        
    try:
        msg = Message(
            subject=subject,
            recipients=[email],
            html=template
        )
        # Send email asynchronously
        threading.Thread(target=send_email_async, args=(app, msg)).start()
    except Exception as e:
        print(f"Error sending email: {e}")

def send_trial_welcome_email(email, name=None):
    """Send welcome email for trial subscription."""
    if not mail:
        return

    greeting = f"Hi {name}," if name else "Hello,"

    # Use your actual Netlify URL and logo file name
    logo_url = "https://geniusmarketingai.netlify.app/Nikson%20Marketing%20Logo%20V1.png"

    template = f"""
    <div style="text-align:center;">
        <img src="{logo_url}" alt="Nikson Marketing Logo" style="max-width:180px; margin-bottom:20px;"/>
    </div>
    <h2>Welcome to Marketing Genius!</h2>
    <p>{greeting}</p>
    <p>Thank you for starting your 7-day free trial. You now have full access to all features:</p>
    <ul>
        <li>AI-Powered Marketing Analysis</li>
        <li>Custom Campaign Strategies</li>
        <li>Social Media Recommendations</li>
        <li>ROI Tracking & Analytics</li>
    </ul>
    <p>Your trial ends on {subscriptions[email]['trial_end']}.</p>
    <p>To continue using the service after your trial, simply subscribe for $20/month.</p>
    """
    send_email(email, "Welcome to Your Marketing Genius Trial", template)

def send_trial_ending_email(email):
    """Send email when trial is ending soon."""
    if not mail:
        return
        
    template = f"""
    <h2>Your access to the Nikson Marketing NZ's - Marketing Genius product Trial is Ending Soon</h2>
    <p>Your 7-day free trial will end in 3 days. Don't lose access to your valuable marketing insights!</p>
    <p>Invest in marketing that runs while you dont for just $20/month to continue using ALL features:</p>
    <ul>
        <li>AI-Powered Marketing Analysis</li>
        <li>Custom Campaign Strategies</li>
        <li>Social Media Recommendations</li>
        <li>ROI Tracking & Analytics</li>
    </ul>
    <p><a href="{os.getenv('FRONTEND_URL')}/subscribe">Click here to subscribe now</a></p>
    """
    send_email(email, "Your Marketing Genius Trial is Ending Soon", template)

def send_subscription_confirmation_email(email):
    """Send email when subscription is activated."""
    if not mail:
        return
        
    template = f"""
    <h2>Welcome to Nikson Marketing NZ's - Marketing Genius Premium!</h2>
    <p>Thank you for subscribing to Marketing Genius. You now have full access to all premium features.</p>
    <p>Your subscription will automatically renew each month for $20.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    """
    send_email(email, "Welcome to Marketing Genius Premium", template)

def get_available_features(subscription):
    """Get features available based on subscription status"""
    if not subscription or not subscription.get('is_active'):
        return {
            'basic_analysis': True,
            'full_analysis': False,
            'social_media_ideas': False,
            'roi_dashboard': False,
            'ab_testing': False
        }
    
    return {
        'basic_analysis': True,
        'full_analysis': True,
        'social_media_ideas': True,
        'roi_dashboard': True,
        'ab_testing': True
    }

def check_trial_limits(email):
    """Check if trial user has exceeded their analysis limit"""
    subscription = subscriptions.get(email)
    if subscription and subscription.get('is_trial'):
        analysis_count = subscription.get('analysis_count', 0)
        if analysis_count >= 3:  # Limit trial users to 3 analyses
            return False
        subscription['analysis_count'] = analysis_count + 1
    return True

def get_paypal_client_id():
    """Get PayPal client ID based on environment"""
    return os.getenv('PAYPAL_CLIENT_ID', 'your_client_id')

@app.route('/')
def index():
    """Render the landing page."""
    return render_template('index.html', paypal_client_id=get_paypal_client_id())

@app.route('/api/create-subscription', methods=['POST'])
def create_subscription():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # 1. Get OAuth2 token from PayPal
        client_id = os.getenv('PAYPAL_CLIENT_ID')
        client_secret = os.getenv('PAYPAL_CLIENT_SECRET')
        auth = (client_id, client_secret)
        headers = {'Accept': 'application/json', 'Accept-Language': 'en_US'}
        token_response = requests.post(
            'https://api-m.paypal.com/v1/oauth2/token',
            headers=headers,
            data={'grant_type': 'client_credentials'},
            auth=auth
        )
        access_token = token_response.json().get('access_token')
        if not access_token:
            return jsonify({'error': 'Could not get PayPal access token'}), 500

        # 2. Create subscription
        sub_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        sub_data = {
            "plan_id": os.getenv('PAYPAL_PLAN_ID'),
            "subscriber": {
                "email_address": email
            },
            "application_context": {
                "brand_name": "Marketing Genius Tool",
                "locale": "en-US",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "SUBSCRIBE_NOW",
                "return_url": "https://geniusmarketingai.netlify.app/success",
                "cancel_url": "https://geniusmarketingai.netlify.app/cancel"
            }
        }
        sub_response = requests.post(
            'https://api-m.paypal.com/v1/billing/subscriptions',
            headers=sub_headers,
            json=sub_data
        )
        sub_json = sub_response.json()
        # Find approval link
        approval_url = None
        for link in sub_json.get('links', []):
            if link.get('rel') == 'approve':
                approval_url = link.get('href')
                break
        if approval_url:
            return jsonify({'approval_url': approval_url})
        else:
            return jsonify({'error': sub_json}), 500

    except Exception as e:
        print(f"Error creating subscription: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/webhook', methods=['POST'])
def webhook():
    """Handle PayPal webhook events"""
    try:
        event_type = request.headers.get('PAYPAL-TRANSMISSION-SIG')
        webhook_id = os.getenv('PAYPAL_WEBHOOK_ID', 'your_webhook_id')
        
        # Verify webhook signature
        if not paypalrestsdk.WebhookEvent.verify(
            request.headers,
            request.data,
            webhook_id
        ):
            return jsonify({'error': 'Invalid webhook signature'}), 400
            
        event = paypalrestsdk.WebhookEvent.find(request.headers.get('PAYPAL-TRANSMISSION-ID'))
        
        if event.event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Find email by subscription ID
            email = next(
                (email for email, sub in subscriptions.items() 
                 if sub.get('subscription_id') == event.resource.id),
                None
            )
            
            if email:
                subscriptions[email].update({
                    'is_active': True,
                    'is_trial': False,
                    'trial_end': None
                })
                send_subscription_confirmation_email(email)
                
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """Handle new subscriptions and trial signups."""
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')  # Get the name from the request

        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if email in subscriptions:
            return jsonify({'error': 'Email already subscribed'}), 400
            
        # Create new subscription with trial
        subscriptions[email] = {
            'is_active': True,
            'is_trial': True,
            'trial_end': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        # Send personalized welcome email
        send_trial_welcome_email(email, name)
        
        return jsonify({'message': 'Trial subscription activated successfully'})
        
    except Exception as e:
        print(f"Error processing subscription: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-subscription', methods=['POST'])
def check_subscription():
    """Check subscription status."""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if email not in subscriptions:
            return jsonify({'error': 'No subscription found'}), 404
            
        subscription = subscriptions[email]
        
        # Check if trial has expired
        if subscription['is_trial']:
            trial_end = datetime.fromisoformat(subscription['trial_end'])
            if datetime.now() > trial_end:
                subscription['is_active'] = False
                subscription['is_trial'] = False
            elif (trial_end - datetime.now()).days <= 3:
                # Send trial ending notification
                send_trial_ending_email(email)
        
        return jsonify(subscription)
        
    except Exception as e:
        print(f"Error checking subscription: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze marketing data"""
    try:
        # Check subscription status first
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        # Check if user has active subscription
        subscription = subscriptions.get(email)
        if not subscription or not subscription.get('is_active'):
            return jsonify({'error': 'Active subscription required'}), 403
            
        if not tool:
            return jsonify({'error': 'Marketing Genius Tool not initialized'}), 500
            
        url = data.get('url')
        employee_count = data.get('employee_count')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        # Parse URL to get keywords
        url_keywords = tool.parse_url_keywords(url)
        
        # Classify industry
        industry = tool.classify_industry(','.join(url_keywords))
        
        # Determine business size
        biz_size = tool.suggest_business_size(employee_count)
        
        # Build campaign
        campaign = tool.build_campaign(url_keywords, industry)
        
        # Get marketing strategy
        strategy = tool.suggest_marketing_strategy(industry, biz_size)
        
        # Get social media ideas
        social_ideas = tool.generate_social_post_ideas(industry)
        
        # Predict performance
        performance = tool.predict_performance(campaign)
        
        # Generate A/B test variations
        ab_variations = tool.ab_test_variations(campaign)
        
        # Allocate budget
        budget_alloc = tool.allocate_budget(campaign, budget=500)
        
        # Get schedule
        schedule = tool.schedule_campaign(campaign)
        
        # Get monitoring alerts
        alerts = tool.monitor_campaign(performance)
        
        # Calculate ROI
        roi = tool.roi_dashboard(spend=500, conversions=30, revenue_per_conversion=25)
        
        # Get content strategy
        content_recs = tool.generate_content_strategy(performance)
        
        return jsonify({
            'keywords': url_keywords,
            'industry': industry,
            'business_size': biz_size,
            'campaign': campaign,
            'strategy': strategy,
            'social_ideas': social_ideas,
            'performance': performance,
            'ab_variations': ab_variations,
            'budget_allocation': budget_alloc,
            'schedule': schedule,
            'alerts': alerts,
            'roi': roi,
            'content_recommendations': content_recs
        })
    except Exception as e:
        print(f"Error analyzing data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})

@app.route('/success')
def success():
    """Handle successful payment"""
    return render_template('index.html')

@app.route('/cancel')
def cancel():
    """Handle cancelled payment"""
    return render_template('index.html')

# Add catch-all route for client-side routing
@app.route('/<path:path>')
def catch_all(path):
    """Catch all routes and serve index.html"""
    return render_template('index.html')

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        # Validate request data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        cart = request.json.get('cart', [])
        if not cart:
            return jsonify({"error": "Cart is required"}), 400

        item = cart[0] if cart else {}
        price = item.get('price', '20.00')
        
        # Validate price
        try:
            float(price)
        except ValueError:
            return jsonify({"error": "Invalid price format"}), 400

        # Create PayPal order
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": price,
                    "currency": "USD",
                    "details": {
                        "subtotal": price
                    }
                },
                "item_list": {
                    "items": [{
                        "name": "Marketing Genius Premium Subscription",
                        "price": price,
                        "currency": "USD",
                        "quantity": 1,
                        "description": "Monthly Premium Subscription - AI-Powered Marketing Insights"
                    }]
                },
                "description": "Marketing Genius Premium Subscription"
            }],
            "redirect_urls": {
                "return_url": "https://geniusmarketingai.netlify.app/success",
                "cancel_url": "https://geniusmarketingai.netlify.app/cancel"
            }
        })

        if payment.create():
            return jsonify({
                "id": payment.id,
                "status": payment.state
            })
        else:
            return jsonify({"error": payment.error}), 400

    except Exception as e:
        print("Failed to create order:", str(e))
        return jsonify({"error": "Failed to create order"}), 500

@app.route('/api/orders/<order_id>/capture', methods=['POST'])
def capture_order(order_id):
    try:
        # Validate request data
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        payer_id = request.json.get('payerID')
        if not payer_id:
            return jsonify({"error": "payerID is required"}), 400

        payment = paypalrestsdk.Payment.find(order_id)
        
        if payment.execute({"payer_id": payer_id}):
            return jsonify({
                "id": payment.id,
                "status": payment.state,
                "purchase_units": [{
                    "payments": {
                        "captures": [{
                            "id": payment.transactions[0].related_resources[0].sale.id,
                            "status": payment.transactions[0].related_resources[0].sale.state
                        }]
                    }
                }]
            })
        else:
            return jsonify({"error": payment.error}), 400

    except Exception as e:
        print("Failed to capture order:", str(e))
        return jsonify({"error": "Failed to capture order"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 