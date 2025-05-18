import { VoiceRecognition } from '../voiceRecognition';

describe('VoiceRecognition', () => {
  let voiceRecognition;
  let mockOnResult;
  let mockOnError;
  let mockOnEnd;

  beforeEach(() => {
    mockOnResult = jest.fn();
    mockOnError = jest.fn();
    mockOnEnd = jest.fn();

    voiceRecognition = new VoiceRecognition({
      onResult: mockOnResult,
      onError: mockOnError,
      onEnd: mockOnEnd,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start voice recognition', () => {
      voiceRecognition.start();

      expect(window.SpeechRecognition).toHaveBeenCalled();
      expect(voiceRecognition.recognition.start).toHaveBeenCalled();
    });

    it('should handle recognition result', () => {
      voiceRecognition.start();

      const recognition = window.SpeechRecognition.mock.results[0].value;
      recognition.onresult({
        results: [[{ transcript: 'test transcript' }]],
      });

      expect(mockOnResult).toHaveBeenCalledWith('test transcript');
    });

    it('should handle recognition error', () => {
      voiceRecognition.start();

      const recognition = window.SpeechRecognition.mock.results[0].value;
      recognition.onerror({ error: 'no-speech' });

      expect(mockOnError).toHaveBeenCalledWith('no-speech');
    });

    it('should handle recognition end', () => {
      voiceRecognition.start();

      const recognition = window.SpeechRecognition.mock.results[0].value;
      recognition.onend();

      expect(mockOnEnd).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop voice recognition', () => {
      voiceRecognition.start();
      voiceRecognition.stop();

      expect(voiceRecognition.recognition.stop).toHaveBeenCalled();
    });
  });

  describe('abort', () => {
    it('should abort voice recognition', () => {
      voiceRecognition.start();
      voiceRecognition.abort();

      expect(voiceRecognition.recognition.abort).toHaveBeenCalled();
    });
  });

  describe('isSupported', () => {
    it('should check if voice recognition is supported', () => {
      const result = VoiceRecognition.isSupported();

      expect(typeof result).toBe('boolean');
    });
  });
}); 