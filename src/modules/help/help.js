export class HelpModule {
    constructor() {
        this.elements = {
            helpBtn: null,
            helpModal: null,
            closeHelpBtn: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.elements = {
            helpBtn: document.getElementById('helpBtn'),
            helpModal: document.getElementById('helpModal'),
            closeHelpBtn: document.getElementById('closeHelpBtn')
        };
    }

    initializeEventListeners() {
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', this.showHelp.bind(this));
        }

        if (this.elements.closeHelpBtn) {
            this.elements.closeHelpBtn.addEventListener('click', this.hideHelp.bind(this));
        }
    }

    showHelp() {
        if (this.elements.helpModal) {
            this.elements.helpModal.style.display = 'block';
        }
    }

    hideHelp() {
        if (this.elements.helpModal) {
            this.elements.helpModal.style.display = 'none';
        }
    }
} 