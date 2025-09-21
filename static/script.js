class MindBridgeChat {
    constructor() {
        this.isProcessing = false;
        this.chatHistory = [];
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.animateWelcome();
        this.setupServiceWorker();
        this.initializeSpeechRecognition();
        this.loadChatHistory();
    }

    bindEvents() {
        // Input handling
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        userInput.addEventListener('input', () => {
            this.adjustTextareaHeight(userInput);
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Quick buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.dataset.message || e.target.textContent;
                document.getElementById('user-input').value = message;
                this.sendMessage();
            });
        });

        // Scroll to bottom on new messages
        this.observeChatMessages();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Online/offline detection
        this.setupConnectivityDetection();
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const input = document.getElementById('user-input');
        const message = input.value.trim();

        if (!message) return;

        this.isProcessing = true;
        document.getElementById('send-btn').disabled = true;

        // Add user message to chat
        this.addMessage(message, 'user');

        input.value = '';
        this.adjustTextareaHeight(input);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.saveToHistory(message, response);
        } catch (error) {
            this.hideTypingIndicator();
            this.showError("Sorry, I'm having trouble connecting. Please try again. 😊");
            console.error('Chat error:', error);
        } finally {
            this.isProcessing = false;
            document.getElementById('send-btn').disabled = false;
            input.focus();
        }
    }

    async getAIResponse(message) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    addMessage(content, type) {
        const chat = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${type === 'user' ? 'You' : 'MindBridge'}:</strong> ${this.formatMessage(content)}
                <span class="message-time">${timestamp}</span>
            </div>
        `;

        // Add animation delay for multiple messages
        messageDiv.style.animationDelay = `${this.chatHistory.length * 0.1}s`;

        chat.appendChild(messageDiv);
        this.scrollToBottom();

        // Add micro-interaction
        this.animateMessage(messageDiv);
    }

    formatMessage(content) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    showTypingIndicator() {
        const chat = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <strong>MindBridge:</strong> 
                <span class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </span>
            </div>
        `;

        chat.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showError(message) {
        const chat = document.getElementById('chat-messages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot-message';
        
        errorDiv.innerHTML = `
            <div class="message-content" style="background: linear-gradient(135deg, #ffe6e6, #ffcccc);">
                <strong>MindBridge:</strong> ${message}
            </div>
        `;

        chat.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const chat = document.getElementById('chat-messages');
        chat.scrollTo({
            top: chat.scrollHeight,
            behavior: 'smooth'
        });
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    observeChatMessages() {
        const chat = document.getElementById('chat-messages');
        const observer = new MutationObserver(() => {
            this.scrollToBottom();
        });

        observer.observe(chat, { childList: true, subtree: true });
    }

    animateWelcome() {
        const welcomeMessage = document.querySelector('.bot-message');
        if (welcomeMessage) {
            welcomeMessage.style.animation = 'messageSlide 0.6s ease-out';
        }
    }

    animateMessage(messageDiv) {
        messageDiv.style.transform = 'translateY(20px)';
        messageDiv.style.opacity = '0';
        
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.transform = 'translateY(0)';
            messageDiv.style.opacity = '1';
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + / to focus input
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                document.getElementById('user-input').focus();
            }

            // Escape to clear input
            if (e.key === 'Escape') {
                document.getElementById('user-input').value = '';
                this.adjustTextareaHeight(document.getElementById('user-input'));
            }
        });
    }

    setupConnectivityDetection() {
        window.addEventListener('online', () => {
            this.showToast('Connection restored! 🌐', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('Connection lost. Working offline.', 'warning');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    saveToHistory(userMessage, botResponse) {
        this.chatHistory.push({
            user: userMessage,
            bot: botResponse,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 messages
        if (this.chatHistory.length > 100) {
            this.chatHistory.shift();
        }

        localStorage.setItem('mindbridge_chat_history', JSON.stringify(this.chatHistory));
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('mindbridge_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            // Add speech button if supported
            this.addSpeechButton();
        }
    }

    addSpeechButton() {
        const inputGroup = document.querySelector('.input-group');
        const speechBtn = document.createElement('button');
        speechBtn.innerHTML = '🎤';
        speechBtn.className = 'speech-btn';
        speechBtn.title = 'Voice input';
        speechBtn.onclick = () => this.startSpeechRecognition();

        speechBtn.style.cssText = `
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            transition: var(--transition);
        `;

        inputGroup.insertBefore(speechBtn, document.getElementById('send-btn'));
    }

    startSpeechRecognition() {
        if (!this.recognition) return;

        this.recognition.start();
        this.showToast('Listening... Speak now', 'info');

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            this.adjustTextareaHeight(document.getElementById('user-input'));
        };

        this.recognition.onerror = (event) => {
            this.showToast('Speech recognition error', 'error');
        };
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }
}

// Initialize the chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .speech-btn:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-hover);
        }
        
        .speech-btn:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    // Initialize chat
    window.mindBridgeChat = new MindBridgeChat();

    // Health check
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('Server status:', data);
        })
        .catch(error => {
            console.warn('Health check failed - working in offline mode');
        });

    // Add loading animation to header
    const header = document.querySelector('header');
    header.style.backgroundSize = '200% 200%';
    header.style.animation = 'gradientShift 3s ease infinite';

    const headerAnimation = document.createElement('style');
    headerAnimation.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(headerAnimation);
});

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(err => console.log('SW registration failed:', err));
}