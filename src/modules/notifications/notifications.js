import { showMessage } from '../../utils/messages.js';

export class NotificationsModule {
    constructor() {
        this.elements = {
            notificationToggle: null
        };
        this.notificationState = {
            isEnabled: false,
            isChecking: false
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
        this.checkNotificationPermission();
    }

    initializeElements() {
        this.elements = {
            notificationToggle: document.getElementById('notificationToggle')
        };
    }

    initializeEventListeners() {
        if (this.elements.notificationToggle) {
            this.elements.notificationToggle.addEventListener('click', this.handleNotificationToggle.bind(this));
        }
    }

    checkNotificationPermission() {
        if (Notification.permission === 'granted') {
            this.notificationState.isEnabled = true;
            if (this.elements.notificationToggle) {
                this.elements.notificationToggle.checked = true;
            }
        }
    }

    handleNotificationToggle() {
        if (this.notificationState.isChecking) return;
        this.notificationState.isChecking = true;

        if (Notification.permission === 'granted') {
            this.notificationState.isEnabled = !this.notificationState.isEnabled;
            showMessage(
                this.notificationState.isEnabled ? 'Notificações ativadas!' : 'Notificações desativadas!',
                this.notificationState.isEnabled ? 'success' : 'info'
            );
        } else if (Notification.permission === 'denied') {
            showMessage('Permissão para notificações foi negada. Por favor, altere nas configurações do navegador.', 'error');
        } else {
            Notification.requestPermission().then(permission => {
                this.notificationState.isEnabled = permission === 'granted';
                showMessage(
                    this.notificationState.isEnabled ? 'Notificações ativadas!' : 'Notificações desativadas!',
                    this.notificationState.isEnabled ? 'success' : 'info'
                );
            });
        }

        this.notificationState.isChecking = false;
    }

    async sendNotification(title, body) {
        if (!('Notification' in window)) {
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/logo.png'
            });
        }
    }
} 