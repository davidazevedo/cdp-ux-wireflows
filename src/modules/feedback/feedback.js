import { showMessage } from '../../utils/messages.js';

export class FeedbackModule {
    constructor() {
        this.elements = {
            feedbackBtn: null,
            feedbackModal: null,
            feedbackForm: null,
            closeFeedbackBtn: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.elements = {
            feedbackBtn: document.getElementById('feedbackBtn'),
            feedbackModal: document.getElementById('feedbackModal'),
            feedbackForm: document.getElementById('feedbackForm'),
            closeFeedbackBtn: document.querySelector('#feedbackModal .close-button')
        };
    }

    initializeEventListeners() {
        if (this.elements.feedbackBtn) {
            this.elements.feedbackBtn.addEventListener('click', this.showFeedback.bind(this));
        }

        if (this.elements.closeFeedbackBtn) {
            this.elements.closeFeedbackBtn.addEventListener('click', this.hideFeedback.bind(this));
        }

        if (this.elements.feedbackForm) {
            this.elements.feedbackForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    showFeedback() {
        if (this.elements.feedbackModal) {
            this.elements.feedbackModal.style.display = 'block';
        }
    }

    hideFeedback() {
        if (this.elements.feedbackModal) {
            this.elements.feedbackModal.style.display = 'none';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.elements.feedbackForm);
        const feedback = {
            type: formData.get('feedbackType'),
            message: formData.get('feedbackMessage')
        };

        // Aqui você pode adicionar a lógica para enviar o feedback
        console.log('Feedback enviado:', feedback);
        showMessage('Feedback enviado com sucesso!', 'success');
        this.hideFeedback();
        this.elements.feedbackForm.reset();
    }
} 