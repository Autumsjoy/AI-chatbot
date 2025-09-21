from flask import Flask, request, jsonify
import random
import time
import threading

app = Flask(__name__)

print("🌉 Starting MindBridge Server...")
print("💡 Make sure to use: http://127.0.0.1:5000")
print("🔧 If port 5000 is busy, we'll try another port...")

class MindBridge:
    def __init__(self):
        self.responses = {
            'sad': [
                "I'm really sorry you're feeling down 😔 Remember, it's okay to not be okay sometimes.",
                "Aw, sad days can feel heavy 💙 I'm here for you whenever you need to talk.",
                "I'm holding space for you right now. You're not carrying this alone 🫂"
            ],
            'anxious': [
                "Anxiety can feel overwhelming! Let's breathe together 🌬️ In... and out...",
                "I get anxious too. Want to try naming 3 things you can see around you?",
                "Anxiety is like a false alarm - your body is trying to protect you 🛡️"
            ],
            'stress': [
                "Stress can feel like too much! How about we break things down? 🧩",
                "When overwhelmed, focus on just one breath at a time 🌬️",
                "Remember to be kind to yourself - you're doing your best 🌿"
            ],
            'default': [
                "I hear you. Thanks for sharing that with me 💙",
                "I'm here with you through this 🤗",
                "That sounds tough. I'm listening, no judgment 🌟",
                "Thank you for trusting me with that 💫"
            ]
        }
    
    def get_response(self, message):
        message = message.lower()
        for emotion in self.responses:
            if emotion in message:
                return random.choice(self.responses[emotion])
        return random.choice(self.responses['default'])

chatbot = MindBridge()

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>MindBridge - Working Chat</title>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px; 
                background: #f0f8ff;
            }
            .chat-container { 
                background: white; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .message { 
                margin: 10px 0; 
                padding: 10px; 
                border-radius: 5px; 
            }
            .user { 
                background: #007bff; 
                color: white; 
                text-align: right; 
            }
            .bot { 
                background: #e9ecef; 
            }
            input { 
                padding: 10px; 
                width: 70%; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
            }
            button { 
                padding: 10px 20px; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <h2>🌉 MindBridge Chat</h2>
            <div id="chat">
                <div class="message bot">🤖: Hello! I'm here to listen. How are you feeling?</div>
            </div>
            <br>
            <input type="text" id="userInput" placeholder="Type your message here...">
            <button onclick="sendMessage()">Send</button>
        </div>

        <script>
            function sendMessage() {
                const input = document.getElementById('userInput');
                const message = input.value.trim();
                if (!message) return;
                
                const chat = document.getElementById('chat');
                chat.innerHTML += `<div class="message user">You: ${message}</div>`;
                input.value = '';
                
                chat.innerHTML += `<div class="message bot">🤖: Thinking...</div>`;
                chat.scrollTop = chat.scrollHeight;
                
                fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message: message})
                })
                .then(response => response.json())
                .then(data => {
                    chat.removeChild(chat.lastChild);
                    chat.innerHTML += `<div class="message bot">🤖: ${data.response}</div>`;
                    chat.scrollTop = chat.scrollHeight;
                })
                .catch(error => {
                    chat.removeChild(chat.lastChild);
                    chat.innerHTML += `<div class="message bot">🤖: Connection issue. Try refreshing.</div>`;
                });
            }
            
            document.getElementById('userInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
        </script>
    </body>
    </html>
    '''

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.get_json()
        message = data.get('message', '')
        time.sleep(1)  # Simulate thinking
        response = chatbot.get_response(message)
        return jsonify({'response': response})
    except:
        return jsonify({'response': "I'm having trouble understanding. Can you try again?"})

def find_available_port(start_port=5000):
    """Find an available port starting from start_port"""
    import socket
    port = start_port
    while port < start_port + 100:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            port += 1
    return start_port  # Fallback

if __name__ == '__main__':
    port = find_available_port()
    print(f"🚀 Starting server on port {port}...")
    print(f"🌐 Open: http://127.0.0.1:{port}")
    print("💡 If this doesn't work, try closing other programs using port 5000")
    
    try:
        app.run(host='127.0.0.1', port=port, debug=True, use_reloader=False)
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔧 Trying a different approach...")
        
        # Fallback: Use different port
        app.run(host='127.0.0.1', port=8080, debug=True, use_reloader=False)