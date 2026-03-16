document.addEventListener('DOMContentLoaded', () => {
    const messagesList = document.getElementById('messages-list');
    const usernameInput = document.getElementById('username-input');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');

    // 1. Fetch and display messages
    async function fetchMessages() {
        try {
            const response = await fetch('/messages');
            if (!response.ok) throw new Error('Failed to fetch');
            
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    // 2. Render messages to the DOM
    function renderMessages(messages) {
        // We only want to append new messages, but for simplicity in this 
        // in-memory version, we will check if the DOM length matches the data length.
        // If they don't match, we clear and rebuild (simple sync strategy).
        // For a more advanced version, we would track IDs.
        
        const currentDomCount = messagesList.querySelectorAll('.message').length;
        
        if (messages.length !== currentDomCount) {
            messagesList.innerHTML = '<div class="system-message">Welcome to the chat room!</div>';
            
            messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message';
                
                const date = new Date(msg.timestamp);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                msgDiv.innerHTML = `
                    <div class="message-header">
                        <span class="username">${escapeHtml(msg.username)}</span>
                        <span class="timestamp">${timeString}</span>
                    </div>
                    <div class="message-text">${escapeHtml(msg.text)}</div>
                `;
                messagesList.appendChild(msgDiv);
            });

            // Auto-scroll to bottom
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    // 3. Send a new message
    async function sendMessage() {
        const username = usernameInput.value.trim();
        const text = messageInput.value.trim();

        if (!username || !text) {
            alert('Please enter both a username and a message.');
            return;
        }

        try {
            const response = await fetch('/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, text })
            });

            if (!response.ok) throw new Error('Failed to send');

            messageInput.value = ''; // Clear input
            messageInput.focus();
            fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    // Security Helper: Prevent XSS
    function escapeHtml(text) {
        if (!text) return text;
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Polling: Fetch messages every 2 seconds
    setInterval(fetchMessages, 2000);

    // Initial fetch
    fetchMessages();
});style.css