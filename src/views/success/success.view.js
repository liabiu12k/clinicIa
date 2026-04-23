import template from './success.html?raw';

export class SuccessView {
    constructor(container) {
        this.container = container;
    }

    render(userName) {
        this.container.innerHTML = template;
        const nameEl = this.container.querySelector('#res-name');
        if (nameEl) nameEl.textContent = userName;
    }
}
