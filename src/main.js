// src/main.js
import { store } from './state/store.js';
import { CameraService } from './services/camera.service.js';
import { LoginView } from './views/login/login.view.js';
import { FaceIDView } from './views/faceid/faceid.view.js';
import { BookingView } from './views/booking/booking.view.js';
import { SuccessView } from './views/success/success.view.js';

const appContainer = document.getElementById('app');
const cameraService = new CameraService();

function navigateToLogin() {
    const login = new LoginView(appContainer, (name) => {
        store.setUser(name, '');
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
    const success = new SuccessView(appContainer);
    success.render(store.user.name, 'identity');
    // The BookingView takes over the entire page layout
    document.getElementById('btn-portal')?.addEventListener('click', navigateToBooking);
}

function navigateToBooking() {
    // BookingView handles all 3 phases internally and takes over the page
    const booking = new BookingView(appContainer, store.user.name, () => {});
    booking.render();
}

// Entry point
navigateToLogin();
