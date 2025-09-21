from flask import Flask, request, jsonify, render_template
import random
import time
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration for Render
class Config:
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

app.config.from_object(Config)

print("🌉 Starting MindBridge - Mental Health Companion")
print("🚀 Deployment Ready for Render")
print(f"🔧 Port: {app.config['PORT']}")
print(f"🔍 Debug: {app.config['DEBUG']}")

class MindBridgeAI:
    def __init__(self):
        # Comprehensive mental health response database
        self.responses = {
            # Depression and sadness
            'sad': [
                "I'm really sorry you're feeling down 😔 Remember, it's completely okay to not be okay sometimes. Want to talk about what's going on?",
                "Aw, sad days can feel so heavy 💙 I'm here for you, and these feelings won't last forever.",
                "I'm holding space for you right now. You're not carrying this sadness alone 🫂",
                "Depression lies to us about our worth. You matter, and these feelings are temporary 🌈"
            ],
            
            # Anxiety and stress
            'anxious': [
                "Anxiety can feel overwhelming! Let's breathe together for a moment 🌬️ In... and out... You're doing great!",
                "I get anxious feelings too. Want to try naming 5 things you can see around you? It helps ground me 🎯",
                "Anxiety is like a false alarm - your body is trying to protect you. Thank it for trying, and let it know you're safe now 🛡️"
            ],
            'stress': [
                "Stress can feel like too much to carry! How about we break things down into tiny steps together? 🧩",
                "When everything feels overwhelming, focus on just one breath at a time. You've got this 🌬️",
                "Remember to be kind to yourself - you're dealing with a lot, and you're doing your best 🌿"
            ],
            
            # Loneliness
            'lonely': [
                "Loneliness can feel so isolating, but I'm right here with you 💫 You're not as alone as it feels",
                "So many people feel lonely sometimes, even when it doesn't seem like it. I'm glad you reached out 🌙"
            ],
            
            # Positive emotions
            'happy': [
                "YAY! 🎉 That's wonderful! I'm so happy for you! Want to celebrate this moment together?",
                "That's amazing! Happy moments are the best 💫 Tell me more about what's making you smile!",
                "I love hearing about happy times! Thanks for sharing the joy with me 🌈"
            ],
            
            # Sleep and fatigue
            'tired': [
                "It's okay to rest, you know 🛋️ Some days are just for recharging. Be gentle with yourself",
                "Tired days are valid too! How about some quiet time together? No pressure to do anything 💤"
            ],
            
            # Crisis responses
            'suicide': [
                "I'm really concerned about what you're saying. Please reach out for immediate help: National Suicide Prevention Lifeline: 988 or Crisis Text Line: text HOME to 741741. You matter, and help is available right now. 💙"
            ],
            'kill myself': [
                "I take this very seriously. Please call 988 right now or go to your nearest emergency room. You matter and there are people who want to help you through this. 🆘"
            ],
            
            # General support
            'help': [
                "I'm here to help however I can! For immediate support: Crisis Text Line (text HOME to 741741) or call 988 🤝"
            ],
            
            # Default responses
            'default': [
                "I hear you. Thanks for sharing that with me 💙",
                "I'm here with you through this. Want to talk more about it? 🤗",
                "That sounds really tough. I'm listening, no judgment ever 🌟",
                "Thank you for trusting me with that. How can I support you best right now? 💫"
            ]
        }
        
        print("🤖 AI Brain loaded with comprehensive mental health knowledge!")
    
    def get_response(self, user_message):
        """Generate an empathetic mental health response"""
        user_message = user_message.lower()
        
        # Check for crisis words first
        crisis_words = ['suicide', 'kill myself', 'end it all', 'want to die', 'harm myself']
        if any(word in user_message for word in crisis_words):
            return random.choice(self.responses['suicide'] + self.responses['kill myself'])
        
        # Check for other emotions
        for emotion, response_list in self.responses.items():
            if emotion != 'default' and any(word in user_message for word in [emotion] + emotion.split()):
                return random.choice(response_list)
        
        # Default empathetic response
        return random.choice(self.responses['default'])

# Initialize AI
mind_bridge = MindBridgeAI()

@app.route('/')
def home():
    """Serve the main chat interface"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'service': 'MindBridge API',
        'version': '1.0.0',
        'python_version': '3.11.0',
        'deployment': 'render',
        'port': app.config['PORT']
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """API endpoint for chat messages"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Get AI response
        ai_response = mind_bridge.get_response(user_message)
        
        return jsonify({
            'response': ai_response,
            'status': 'success',
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print(f"🚀 Server starting on port {app.config['PORT']}...")
    print("🌐 Your app will be available at: http://localhost:5000")
    print("📊 Health check: http://localhost:5000/api/health")
    
    # Use Gunicorn in production, Flask dev server in development
    if app.config['DEBUG']:
        app.run(host='0.0.0.0', port=app.config['PORT'], debug=True)
    else:
        # For production, we use Gunicorn which is called from the Procfile
        print("🏗️ Production mode - using Gunicorn via Procfile")
        app.run(host='0.0.0.0', port=app.config['PORT'], debug=False)