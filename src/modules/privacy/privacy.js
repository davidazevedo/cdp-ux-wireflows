import { showMessage } from '../../utils/messages.js';


export class PrivacyModule {
    constructor() {
        this.elements = {
            privacyNotice: null,
            acceptPrivacyBtn: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.elements = {
            privacyNotice: document.getElementById('privacyNotice'),
            acceptPrivacyBtn: document.getElementById('acceptPrivacyBtn')
        };
    }

    initializeEventListeners() {
        if (this.elements.acceptPrivacyBtn) {
            this.elements.acceptPrivacyBtn.addEventListener('click', this.handleAcceptPrivacy.bind(this));
        }
    }

    showPrivacyNotice() {
        if (this.elements.privacyNotice) {
            this.elements.privacyNotice.style.display = 'block';
        }
    }

    handleAcceptPrivacy() {
        localStorage.setItem('privacyAccepted', 'true');
        if (this.elements.privacyNotice) {
            this.elements.privacyNotice.style.display = 'none';
        }
        showMessage('Política de privacidade aceita com sucesso!', 'success');
    }
} 