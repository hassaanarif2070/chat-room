import datetime
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='public', static_url_path='')
# In-memory storage for messages
# Each message will be a dictionary: { 'username': str, 'text': str, 'timestamp': str }
messages = []

@app.route('/')
def index():
    """Serve the main HTML file."""
    return send_from_directory('public', 'index.html')

@app.route('/messages', methods=['GET'])
def get_messages():
    """Return all stored messages."""
    return jsonify(messages)

@app.route('/messages', methods=['POST'])
def post_message():
    """Receive a new message, add timestamp, and store it."""
    data = request.get_json()
    
    # Basic validation
    if not data or 'username' not in data or 'text' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    username = data['username'].strip()
    text = data['text'].strip()
    
    if not username or not text:
        return jsonify({'error': 'Username and text cannot be empty'}), 400

    # Create message object with ISO format timestamp
    new_message = {
        'username': username,
        'text': text,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    messages.append(new_message)
    return jsonify(new_message), 201

if __name__ == '__main__':
    # Run the app on localhost port 5000
    app.run(debug=True, port=5000)