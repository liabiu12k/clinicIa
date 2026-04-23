import scanTemplate from './faceid.html?raw';
import confirmTemplate from './confirm.html?raw';

export class FaceIDView {
    constructor(container, cameraService, onComplete) {
        this.container = container;
        this.cameraService = cameraService;
        this.onComplete = onComplete;
        this._capturedDataUrl = null;
    }

    async render(userName) {
        // Step 1: Scanning state (Image 1 prototype)
        this.container.innerHTML = scanTemplate;
        const video = this.container.querySelector('#video');
        this.cameraService.videoElement = video;

        const success = await this.cameraService.start();

        // If camera fails, simulate a captured image after delay
        setTimeout(() => {
            if (success && video) {
                this._capturedDataUrl = this._captureFrame(video);
            }
            this.cameraService.stop();
            this._showConfirmation(userName);
        }, 4000);
    }

    /**
     * Capture a single frame from the video element using canvas
     */
    _captureFrame(video) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            // Mirror the capture to match mirrored video display
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
            console.warn('Could not capture frame:', e);
            return null;
        }
    }

    _showConfirmation(userName) {
        // Step 2: Confirmation state (Image 2 prototype)
        this.container.innerHTML = confirmTemplate;

        // Draw captured frame into canvas
        const canvas = this.container.querySelector('#snapshot-canvas');
        if (canvas && this._capturedDataUrl) {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
            img.src = this._capturedDataUrl;
        } else if (canvas) {
            // Fallback placeholder if camera was unavailable
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 24px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Vista previa no disponible', canvas.width / 2, canvas.height / 2);
        }

        // Retry → restart the entire scan flow
        this.container.querySelector('#btn-retry')?.addEventListener('click', () => {
            this._capturedDataUrl = null;
            this.render(userName);
        });

        // Confirm → navigate forward
        this.container.querySelector('#btn-confirm')?.addEventListener('click', () => {
            this.onComplete();
        });
    }
}
