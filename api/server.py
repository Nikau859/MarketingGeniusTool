from flask import Flask, request, jsonify
from flask_cors import CORS
from marketing_genius_tool import MarketingGeniusTool
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask_mail import Mail, Message

load_dotenv()

app = Flask(__name__)

# --- App Configuration ---
# You must set this in your Netlify environment variables
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'default-secret-key-for-dev')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# --- Initialize Extensions ---
CORS(app, resources={r"/api/*": {"origins": "*"}})
mail = Mail(app)
try:
    tool = MarketingGeniusTool()
except Exception as e:
    print(f"Error initializing Marketing Genius Tool: {e}")
    tool = None

# --- JWT Auth Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401

        try:
            jwt.decode(token, app.config['JWT_SECRET'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Trial has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Authentication token is invalid!', 'error': str(e)}), 401

        return f(*args, **kwargs)
    return decorated

# --- Email Sending ---
def send_trial_welcome_email(email):
    try:
        if not mail.default_sender: return
        msg = Message(
            subject="Welcome to Your Marketing Genius Trial",
            recipients=[email],
            html="<h2>Welcome!</h2><p>Your 7-day free trial for the Marketing Genius Tool has started.</p>"
        )
        mail.send(msg)
    except Exception as e:
        print(f"Error sending email: {e}")

# --- API Routes ---
@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email']
    
    token = jwt.encode({
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['JWT_SECRET'], algorithm="HS256")

    send_trial_welcome_email(email)

    return jsonify({'token': token})

@app.route('/api/analyze', methods=['POST'])
@token_required
def analyze():
    if not tool:
        return jsonify({'error': 'Analysis tool is currently unavailable.'}), 503
    
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400

    try:
        result = tool.analyze(url=data['url'], employee_count=data.get('employee_count'))
        return jsonify(result)
    except Exception as e:
        print(f"Analysis failed for URL {data.get('url')}: {e}")
        return jsonify({'error': 'An unexpected error occurred during analysis.'}), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"}) 