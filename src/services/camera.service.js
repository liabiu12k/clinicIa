// src/services/camera.service.js
export class CameraService {
    constructor(videoElement = null) {
        this.videoElement = videoElement;
        this.stream = null;
    }

    async start() {
        if (!this.videoElement) {
            console.error("No video element provided");
            return false;
        }
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            return true;
        } catch (err) {
            console.error("Camera acceso denegado:", err);
            return false;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
    }
}
