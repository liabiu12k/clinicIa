// src/services/voice.service.js
export class VoiceService {
    static speak(text) {
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    }

    static announceAppointment(user, specialty, location, time) {
        const message = `Cita confirmada, ${user}. Tu médico de ${specialty} te espera en el ${location} a las ${time}. Se ha enviado un recordatorio a tu móvil.`;
        this.speak(message);
    }
}
