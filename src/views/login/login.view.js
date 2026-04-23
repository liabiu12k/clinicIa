import template from './login.html?raw';

export class LoginView {
    constructor(container, onLogin) {
        this.container = container;
        this.onLogin = onLogin;
    }

    render() {
        this.container.innerHTML = template;
        this.attachEvents();
    }

    attachEvents() {
        const btn = this.container.querySelector('#btn-login');
        btn.addEventListener('click', () => {
            const name = this.container.querySelector('#username').value;
            const email = this.container.querySelector('#email').value;
            if (name) this.onLogin(name, email);
            else alert('Ingresa tu nombre');
        });
    }
}
