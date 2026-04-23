import template from './success.html?raw';

export class SuccessView {
    constructor(container) {
        this.container = container;
    }

    render(userName) {
        this.container.innerHTML = template;
        this.container.querySelector('#res-name').textContent = userName;
        this.container.querySelector('#btn-restart').addEventListener('click', () => location.reload());
    }
}
