import { showMessage } from '../../utils/messages.js';

export class LocationModule {
    constructor() {
        this.elements = {
            locationRequest: null,
            manualLocation: null,
            loading: null,
            addressInput: null,
            searchBtn: null,
            useCurrentLocationBtn: null
        };
        this.locationState = {
            isRequesting: false,
            currentLocation: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.elements = {
            locationRequest: document.getElementById('locationRequest'),
            manualLocation: document.getElementById('manualLocation'),
            loading: document.getElementById('loading'),
            addressInput: document.getElementById('addressInput'),
            searchBtn: document.getElementById('searchBtn'),
            useCurrentLocationBtn: document.getElementById('useCurrentLocationBtn')
        };
    }

    initializeEventListeners() {
        if (this.elements.useCurrentLocationBtn) {
            this.elements.useCurrentLocationBtn.addEventListener('click', this.handleCurrentLocation.bind(this));
        }

        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', this.handleManualLocation.bind(this));
        }

        if (this.elements.addressInput) {
            this.elements.addressInput.addEventListener('keypress', this.handleAddressKeyPress.bind(this));
        }
    }

    handleCurrentLocation() {
        if (this.locationState.isRequesting) return;
        this.locationState.isRequesting = true;

        if (!navigator.geolocation) {
            showMessage('Geolocalização não suportada neste navegador', 'error');
            this.locationState.isRequesting = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            this.handleLocationSuccess.bind(this),
            this.handleLocationError.bind(this)
        );
    }

    handleLocationSuccess(position) {
        this.locationState.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        this.locationState.isRequesting = false;
        showMessage('Localização obtida com sucesso!', 'success');
        screenManager.showScreen('kitchens');
    }

    handleLocationError(error) {
        this.locationState.isRequesting = false;
        console.error('Erro ao obter localização:', error);
        showMessage('Erro ao obter localização. Por favor, tente novamente.', 'error');
        screenManager.showScreen('manualLocation');
    }

    handleManualLocation() {
        const address = this.elements.addressInput.value.trim();
        if (!address) {
            showMessage('Por favor, insira um endereço válido', 'error');
            return;
        }

        // Aqui você pode adicionar a lógica para geocodificar o endereço
        console.log('Endereço pesquisado:', address);
        showMessage('Endereço encontrado!', 'success');
        screenManager.showScreen('kitchens');
    }

    handleAddressKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleManualLocation();
        }
    }
} 