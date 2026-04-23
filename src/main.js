// src/main.js
import { store } from './state/store.js';
import { VoiceService } from './services/voice.service.js';
import { CameraService } from './services/camera.service.js';

import { LoginView } from './views/login/login.view.js';
import { FaceIDView } from './views/faceid/faceid.view.js';
import { BookingView } from './views/booking/booking.view.js';
import { SuccessView } from './views/success/success.view.js';

const appContainer = document.getElementById('app');
const cameraService = new CameraService();

/**
 * Navigation / Router
 */
function navigateToLogin() {
    const login = new LoginView(appContainer, (name, email) => {
        store.setUser(name, email);
        navigateToFaceID();
    });
    login.render();
}

function navigateToFaceID() {
    const faceid = new FaceIDView(appContainer, cameraService, () => {
        navigateToIdentitySuccess();
    });
    faceid.render(store.user.name);
}

function navigateToIdentitySuccess() {
    // Show Image 2 style success card
    const success = new SuccessView(appContainer);
    success.render(store.user.name);
    
    // Change button text and behavior to lead to Booking
    const btn = document.getElementById('btn-portal');
    if (btn) {
        btn.textContent = "Acceder a Citas";
        btn.addEventListener('click', navigateToBooking);
    }
}

function navigateToBooking() {
    const booking = new BookingView(appContainer, (specialty) => {
        store.setAppointment(specialty);
        finalizeProcess();
    });
    booking.render();
}

function finalizeProcess() {
    // Update the success view with final details and trigger TTS
    const success = new SuccessView(appContainer);
    success.render(store.user.name);
    
    const title = appContainer.querySelector('h2');
    if (title) title.textContent = "¡Cita Reservada!";
    
    const subtitle = appContainer.querySelector('p');
    if (subtitle) subtitle.textContent = "Tu turno ha sido procesado por el sistema";

    // Trigger Voice Notification
    VoiceService.announceAppointment(
        store.user.name,
        store.appointment.specialty,
        store.appointment.location,
        store.appointment.time
    );

    // Final button resets the app
    const btn = document.getElementById('btn-portal');
    if (btn) {
        btn.textContent = "Nueva Verificación";
        btn.addEventListener('click', () => location.reload());
    }
}

// Entry point
navigateToLogin();
