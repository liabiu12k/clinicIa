import scanTemplate from './faceid.html?raw';
import confirmTemplate from './confirm.html?raw';

export class FaceIDView {
    constructor(container, cameraService, onComplete) {
        this.container = container;
        this.cameraService = cameraService;
        this.onComplete = onComplete;
    }

    async render(userName) {
        // Step 1: Scanning (Image 1)
        this.container.innerHTML = scanTemplate;
        const video = this.container.querySelector('#video');
        this.cameraService.videoElement = video;
        
        const success = await this.cameraService.start();
        
        if (!success) {
            alert('Error al acceder a la cámara. Por favor asegúrate de dar permisos.');
        }

        // Simulate Scanning delay
        setTimeout(() => {
            this.showConfirmation(userName);
        }, 4000);
    }

    showConfirmation(userName) {
        this.cameraService.stop();
        this.container.innerHTML = confirmTemplate;

        this.container.querySelector('#btn-retry').addEventListener('click', () => {
            this.render(userName);
        });

        this.container.querySelector('#btn-confirm').addEventListener('click', () => {
            this.onComplete();
        });
    }
}
