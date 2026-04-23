export class SuccessView {
    constructor(container) {
        this.container = container;
    }

    render(userName, mode = 'identity') {
        const title = mode === 'booking' ? '¡Cita Reservada!' : '¡Verificación Exitosa!';
        const subtitle = mode === 'booking'
            ? 'Tu turno ha sido procesado por el sistema de ClinicIA'
            : 'Tu identidad ha sido confirmada correctamente';
        const btnLabel = mode === 'booking' ? 'Nueva Verificación' : 'Acceder al Portal';

        this.container.innerHTML = `
        <div class="module-card">
            <div style="width:90px; height:90px; background:#dcfce7; border-radius:50%; display:flex; justify-content:center; align-items:center; margin-bottom:20px;">
                <i class="fas fa-check-circle" style="font-size:3rem; color:#16a34a;"></i>
            </div>

            <h2 style="font-size: 1.5rem; margin-bottom: 8px;">${title}</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">${subtitle}</p>

            <div style="width:100%; background:#f8fafc; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:28px;">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid #e2e8f0;">
                    <span style="color:var(--text-muted); font-size:0.9rem;">Nombre:</span>
                    <span style="font-weight:700; color:var(--text-main);">${userName}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid #e2e8f0;">
                    <span style="color:var(--text-muted); font-size:0.9rem;">ID Paciente:</span>
                    <span style="font-weight:700; color:var(--text-main);">#PAC-2024-1567</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 20px;">
                    <span style="color:var(--text-muted); font-size:0.9rem;">Último acceso:</span>
                    <span style="font-weight:700; color:var(--text-main);">Hoy, ${new Date().toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
            </div>

            <button id="btn-portal" class="btn-primary">${btnLabel}</button>
        </div>`;
    }
}
