import { CpfScreen } from '../cpf';

describe('CpfScreen', () => {
  let cpfScreen;
  let mockElements;

  beforeEach(() => {
    // Mock dos elementos do DOM
    mockElements = {
      cpfInput: document.createElement('input'),
      nisInput: document.createElement('input'),
      continueBtn: document.createElement('button'),
      backBtn: document.createElement('button'),
      cpfValidationMessage: document.createElement('div'),
      nisValidationMessage: document.createElement('div'),
      voiceButtons: [
        document.createElement('button'),
        document.createElement('button'),
      ],
    };

    // Configurar os elementos
    mockElements.cpfInput.id = 'cpf';
    mockElements.nisInput.id = 'nis';
    mockElements.continueBtn.id = 'continueBtn';
    mockElements.backBtn.id = 'backBtn';

    // Adicionar elementos ao DOM
    document.body.appendChild(mockElements.cpfInput);
    document.body.appendChild(mockElements.nisInput);
    document.body.appendChild(mockElements.continueBtn);
    document.body.appendChild(mockElements.backBtn);
    mockElements.voiceButtons.forEach(btn => document.body.appendChild(btn));

    // Criar instância do CpfScreen
    cpfScreen = new CpfScreen();
  });

  afterEach(() => {
    // Limpar o DOM
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('handleCPFInput', () => {
    it('should format CPF input correctly', () => {
      const event = { target: { value: '52998224725' } };
      cpfScreen.handleCPFInput(event);
      expect(event.target.value).toBe('529.982.247-25');
    });

    it('should validate CPF input', () => {
      const event = { target: { value: '529.982.247-25' } };
      cpfScreen.handleCPFInput(event);
      expect(mockElements.cpfValidationMessage.textContent).toBe('CPF válido');
    });

    it('should show error for invalid CPF', () => {
      const event = { target: { value: '123.456.789-00' } };
      cpfScreen.handleCPFInput(event);
      expect(mockElements.cpfValidationMessage.textContent).toBe('CPF inválido');
    });
  });

  describe('handleNISInput', () => {
    it('should format NIS input correctly', () => {
      const event = { target: { value: '12345678901' } };
      cpfScreen.handleNISInput(event);
      expect(event.target.value).toBe('123.45678.90-1');
    });

    it('should validate NIS input', () => {
      const event = { target: { value: '123.45678.90-1' } };
      cpfScreen.handleNISInput(event);
      expect(mockElements.nisValidationMessage.textContent).toBe('NIS válido');
    });

    it('should show error for invalid NIS', () => {
      const event = { target: { value: '123' } };
      cpfScreen.handleNISInput(event);
      expect(mockElements.nisValidationMessage.textContent).toBe('NIS deve ter 11 dígitos');
    });
  });

  describe('handleVoiceInput', () => {
    it('should start voice recognition', () => {
      const event = { currentTarget: mockElements.voiceButtons[0] };
      cpfScreen.handleVoiceInput(event);
      expect(mockElements.voiceButtons[0].classList.contains('recording')).toBe(true);
    });

    it('should handle voice recognition result', () => {
      const event = { currentTarget: mockElements.voiceButtons[0] };
      cpfScreen.handleVoiceInput(event);

      // Simular resultado do reconhecimento de voz
      const recognition = window.SpeechRecognition.mock.results[0].value;
      recognition.onresult({ results: [[{ transcript: '52998224725' }]] });

      expect(mockElements.cpfInput.value).toBe('529.982.247-25');
    });

    it('should handle voice recognition error', () => {
      const event = { currentTarget: mockElements.voiceButtons[0] };
      cpfScreen.handleVoiceInput(event);

      // Simular erro no reconhecimento de voz
      const recognition = window.SpeechRecognition.mock.results[0].value;
      recognition.onerror({ error: 'no-speech' });

      expect(mockElements.voiceButtons[0].classList.contains('recording')).toBe(false);
    });
  });

  describe('handleContinue', () => {
    it('should save valid CPF and NIS', async () => {
      mockElements.cpfInput.value = '529.982.247-25';
      mockElements.nisInput.value = '123.45678.90-1';

      await cpfScreen.handleContinue();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'encryptedCPF',
        expect.any(String)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'encryptedNIS',
        expect.any(String)
      );
    });

    it('should show error for invalid CPF', async () => {
      mockElements.cpfInput.value = '123.456.789-00';
      mockElements.nisInput.value = '';

      await cpfScreen.handleContinue();

      expect(mockElements.continueBtn.classList.contains('error')).toBe(true);
    });

    it('should show error for invalid NIS', async () => {
      mockElements.cpfInput.value = '';
      mockElements.nisInput.value = '123';

      await cpfScreen.handleContinue();

      expect(mockElements.continueBtn.classList.contains('error')).toBe(true);
    });
  });
}); 