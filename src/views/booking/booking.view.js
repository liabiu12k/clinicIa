import template from './booking.html?raw';

export class BookingView {
    constructor(container, onBook) {
        this.container = container;
        this.onBook = onBook;
    }

    render() {
        this.container.innerHTML = template;
        this.container.querySelector('#btn-book').addEventListener('click', () => {
            const specialty = this.container.querySelector('#specialty').value;
            this.onBook(specialty);
        });
    }
}
