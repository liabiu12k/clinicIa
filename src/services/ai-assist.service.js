// src/services/ai-assist.service.js
import { VoiceService } from './voice.service.js';

export class AIAssistService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this._init();
    }

    _init() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { console.warn('SpeechRecognition no disponible en este navegador'); return; }
        this.recognition = new SR();
        this.recognition.lang = 'es-PE';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
    }

    greet(userName) {
        const msg = `Hola ${userName}, soy tu asistente Clínico IA. Puedes decirme qué especialidad necesitas o seleccionar un área médica.`;
        VoiceService.speak(msg);
    }

    confirmSpecialty(specialtyName) {
        VoiceService.speak(`Entendido. Buscando especialistas en ${specialtyName}. Un momento por favor.`);
    }

    announceDoctor(doctorName, time, location) {
        VoiceService.speak(`Perfecto. Tu cita con ${doctorName} ha sido confirmada a las ${time} en el ${location}. Se enviará un recordatorio a tu móvil.`);
    }

    startListening(onResult, onEnd) {
        if (!this.recognition) { onEnd && onEnd(); return; }
        try {
            this.recognition.start();
            this.isListening = true;
            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript.toLowerCase().trim();
                onResult(transcript);
            };
            this.recognition.onerror = () => { this.isListening = false; onEnd && onEnd(); };
            this.recognition.onend = () => { this.isListening = false; onEnd && onEnd(); };
        } catch(e) { 
            this.isListening = false; 
            onEnd && onEnd(); 
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    matchSpecialty(transcript, specialties) {
        return specialties.find(s => s.keywords.some(kw => transcript.includes(kw))) || null;
    }
}
