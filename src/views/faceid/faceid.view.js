export class FaceIDView {
    constructor(container, cameraService, onComplete) {
        this.container = container;
        this.cameraService = cameraService;
        this.onComplete = onComplete;
        this._capturedDataUrl = null;
    }

    async render(userName) {
        // Step 1: Scanning state
        this.container.innerHTML = `
        <div class="module-card">
            <div class="scan-circle" id="scan-circle">
                <video id="video" autoplay playsinline style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; transform: scaleX(-1);"></video>
            </div>
            <h2 id="scan-status-title" style="margin-bottom: 8px;">Capturando imagen...</h2>
            <p style="color: var(--text-muted);">Mantén tu rostro centrado en el círculo</p>
            <div class="dots-loader" style="margin-top: 16px;">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>`;

        const video = this.container.querySelector('#video');
        this.cameraService.videoElement = video;
        const success = await this.cameraService.start();

        setTimeout(() => {
            if (success && video.readyState >= 2) {
                this._capturedDataUrl = this._captureFrame(video);
            }
            this.cameraService.stop();
            this._showConfirmation(userName);
        }, 4000);
    }

    _captureFrame(video) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
            console.warn('Frame capture failed:', e);
            return null;
        }
    }

    _showConfirmation(userName) {
        // Step 2: Confirmation state
        const imgHtml = this._capturedDataUrl
            ? `<img src="${this._capturedDataUrl}" style="width:100%; display:block;">`
            : `<div style="width:100%; aspect-ratio:4/3; background:#e2e8f0; display:flex; justify-content:center; align-items:center;">
                   <i class="fas fa-user" style="font-size:5rem; color:#94a3b8;"></i>
               </div>`;

        this.container.innerHTML = `
        <div class="module-card">
            <h2 style="font-size: 1.4rem; margin-bottom: 6px;">Verificar Identidad</h2>
            <p style="color: var(--text-muted); margin-bottom: 16px;">Por favor confirma que la imagen es correcta</p>

            <div style="width:100%; border-radius:12px; overflow:hidden; border:2px solid var(--primary-blue); margin-bottom:16px;">
                ${imgHtml}
            </div>

            <div style="background:#eff6ff; padding:12px 16px; border-radius:10px; border:1px solid #bfdbfe; color:#1d4ed8; font-size:0.875rem; display:flex; align-items:center; gap:10px; margin-bottom:24px; text-align:left; width:100%;">
                <i class="fas fa-check-circle" style="font-size:1.1rem; flex-shrink:0;"></i>
                <span><strong>Identificación detectada:</strong> La imagen cumple con los requisitos de calidad</span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%;">
                <button id="btn-retry" class="btn-secondary">Reintentar</button>
                <button id="btn-confirm" class="btn-primary">Confirmar</button>
            </div>
        </div>`;

        this.container.querySelector('#btn-retry')?.addEventListener('click', () => {
            this._capturedDataUrl = null;
            this.render(userName);
        });
        this.container.querySelector('#btn-confirm')?.addEventListener('click', () => this.onComplete());
    }
}
