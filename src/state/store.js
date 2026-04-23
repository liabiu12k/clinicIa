// src/state/store.js
export const store = {
    user: {
        name: '',
        email: ''
    },
    appointment: {
        specialty: '',
        location: 'Consultorio 302',
        time: '10:00 AM'
    },
    
    setUser(name, email) {
        this.user.name = name;
        this.user.email = email;
    },
    
    setAppointment(specialty) {
        this.appointment.specialty = specialty;
    }
};
