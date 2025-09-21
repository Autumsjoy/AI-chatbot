class MindBridgeChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearBtn = document.getElementById('clear-chat');
        this.quickButtons = document.querySelectorAll('.quick-btn');
        
        this.apiUrl = 'http://localhost:5000/api/chat';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.clearBtn.addEventListener('click', () => this.clearChat());
        
        this.quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.userInput.value = e.target.dataset.message;
                this.sendMessage();
            });
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.userInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("Sorry, I'm having trouble connecting. Please try again. 😊", 'bot');
            console.error('API Error:', error);
        }
    }

    async getAIResponse(message) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.response;
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'bot') {
            contentDiv.innerHTML = `<strong>MindBridge:</strong> ${content}`;
        } else {
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message bot-message';
        typingDiv.innerHTML = `
            <div class="message-content">
                <strong>MindBridge:</strong> 
                <span class="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                </span>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <strong>MindBridge:</strong> Hey there! 👋 I'm MindBridge, your mental health friend. How are you feeling today?
                </div>
            </div>
        `;
    }
}

// Add typing animation to CSS
const style = document.createElement('style');
style.textContent = `
    .typing-dots span {
        animation: typing 1.4s infinite;
        opacity: 0.6;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
        0%, 60%, 100% { opacity: 0.6; }
        30% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
    new MindBridgeChat();
});