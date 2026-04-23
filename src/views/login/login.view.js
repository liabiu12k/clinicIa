export class LoginView {
    constructor(container, onLogin) {
        this.container = container;
        this.onLogin = onLogin;
    }

    render() {
        this.container.innerHTML = `
        <div class="module-card">
            <div class="benefit-icon" style="width: 70px; height: 70px; margin-bottom: 20px; background: #eff6ff;">
                <i class="fas fa-user-circle" style="font-size: 2rem; color: var(--primary-blue);"></i>
            </div>
            <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Portal del Paciente</h2>
            <p style="color: var(--text-muted); margin-bottom: 28px;">Ingresa tus datos para iniciar la verificación biométrica</p>
            
            <div style="width: 100%; text-align: left; margin-bottom: 20px;">
                <label style="display: block; font-size: 0.875rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">Nombre Completo</label>
                <input type="text" id="username" placeholder="Ej. Juan Pérez García"
                       style="width: 100%; padding: 14px 16px; border-radius: 10px; border: 1px solid #e2e8f0; font-family: inherit; font-size: 1rem; outline: none; transition: border 0.2s;"
                       onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
            </div>

            <button id="btn-login" class="btn-primary">Comenzar Identificación</button>
        </div>`;
        this.attachEvents();
    }

    attachEvents() {
        this.container.querySelector('#btn-login').addEventListener('click', () => {
            const name = this.container.querySelector('#username').value.trim();
            if (name) this.onLogin(name);
            else alert('Por favor ingresa tu nombre');
        });
    }
}
