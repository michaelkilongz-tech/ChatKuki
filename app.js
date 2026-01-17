// DEEPSEEK AI CHAT - GUARANTEED WORKING VERSION
console.log("🚀 DeepSeek AI Chat Loading...");

class DeepSeekChat {
    constructor() {
        this.backendUrl = 'https://eiho-chat.vercel.app/api/chat';
        this.isTyping = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log("✅ Initializing chat app...");
        
        this.setupElements();
        this.setupEventListeners();
        this.setupTextarea();
        
        console.log("✅ App ready!");
    }
    
    setupElements() {
        // Store DOM elements
        this.elements = {
            sidebar: document.querySelector('.sidebar'),
            menuBtn: document.getElementById('menuBtn'),
            closeSidebar: document.getElementById('closeSidebar'),
            newChatBtn: document.getElementById('newChatBtn'),
            sendBtn: document.getElementById('sendBtn'),
            messageInput: document.getElementById('messageInput'),
            chatContainer: document.getElementById('chatContainer'),
            logoutBtn: document.getElementById('logoutBtn')
        };
        
        console.log("Elements found:", Object.keys(this.elements));
    }
    
    setupEventListeners() {
        console.log("🔗 Setting up event listeners...");
        
        // Menu button toggles sidebar
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => {
                this.elements.sidebar.classList.toggle('active');
            });
        }
        
        // Close sidebar button
        if (this.elements.closeSidebar) {
            this.elements.closeSidebar.addEventListener('click', () => {
                this.elements.sidebar.classList.remove('active');
            });
        }
        
        // New chat button
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => {
                if (confirm('Start a new chat?')) {
                    this.clearChat();
                }
            });
        }
        
        // Send button
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Logout/Refresh button
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                location.reload();
            });
        }
        
        console.log("✅ Event listeners set up");
    }
    
    setupTextarea() {
        const textarea = this.elements.messageInput;
        if (!textarea) return;
        
        // Auto-resize
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
        
        // Enter to send (Shift+Enter for new line)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Enable/disable send button
        textarea.addEventListener('input', () => {
            this.elements.sendBtn.disabled = textarea.value.trim() === '';
        });
        
        // Initial state
        this.elements.sendBtn.disabled = true;
    }
    
    async sendMessage() {
        if (this.isTyping) return;
        
        const message = this.elements.messageInput.value.trim();
        if (!message) return;
        
        console.log("📤 Sending message:", message);
        
        // Clear input
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        this.elements.sendBtn.disabled = true;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing
        this.isTyping = true;
        const typingId = this.showTyping();
        
        try {
            // Call backend
            console.log("🌐 Calling backend:", this.backendUrl);
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: 'llama-3.1-8b-instant'
                })
            });
            
            console.log("📥 Response status:", response.status);
            const data = await response.json();
            console.log("📥 Response data:", data);
            
            // Remove typing
            this.removeTyping(typingId);
            this.isTyping = false;
            
            if (data.success) {
                this.addMessage(data.response, 'ai');
            } else {
                this.addMessage(`Error: ${data.error || 'Unknown error'}`, 'ai');
            }
            
        } catch (error) {
            console.error("❌ Chat error:", error);
            this.removeTyping(typingId);
            this.isTyping = false;
            this.addMessage('Connection error. Please try again.', 'ai');
        }
    }
    
    addMessage(text, role) {
        const container = this.elements.chatContainer;
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const sender = role === 'user' ? 'You' : 'DeepSeek AI';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Simple text formatting
        let formattedText = text
            .replace(/</g, '&lt;').replace(/>/g, '&gt;') // Escape HTML
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <p>${formattedText}</p>
                </div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTyping() {
        const container = this.elements.chatContainer;
        if (!container) return null;
        
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'message ai-message';
        
        typingDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(typingDiv);
        this.scrollToBottom();
        return typingId;
    }
    
    removeTyping(id) {
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }
    
    clearChat() {
        const container = this.elements.chatContainer;
        if (container) {
            container.innerHTML = `
                <div class="message ai-message">
                    <div class="avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">
                            <p>Hello! I'm DeepSeek AI. How can I help you today?</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    scrollToBottom() {
        const container = this.elements.chatContainer;
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }
}

// Start the app
console.log("🎯 Starting DeepSeek AI Chat...");
window.chatApp = new DeepSeekChat();
