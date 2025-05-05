// Define message styles
const messageStyles = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateX(120%);
        transition: transform 0.3s ease-in-out;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
    }

    .message.show {
        transform: translateX(0);
    }

    .message.success {
        background-color: #4CAF50;
    }

    .message.error {
        background-color: #F44336;
    }

    .message.warning {
        background-color: #FF9800;
    }

    .message.info {
        background-color: #2196F3;
    }

    @media (max-width: 768px) {
        .message {
            top: 10px;
            right: 10px;
            max-width: calc(100% - 20px);
        }
    }
`;

// Inject styles into the document
const styleElement = document.createElement('style');
styleElement.textContent = messageStyles;
document.head.appendChild(styleElement);

export function showMessage(message, type = 'info') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.textContent = message;

    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.remove();
        }, 300);
    }, 3000);
} 