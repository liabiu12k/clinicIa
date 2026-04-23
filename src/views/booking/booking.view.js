import { AIAssistService } from '../../services/ai-assist.service.js';

// ── Data ─────────────────────────────────────────────────────
const SPECIALTIES = [
    { id: 'cardio',   name: 'Cardiología',      desc: 'Cuidado del corazón y sistema circulatorio', specialists: 8,  icon: 'fa-heart',        bg: '#fee2e2', color: '#ef4444', keywords: ['cardiología','cardio','corazón','cardiólogo'] },
    { id: 'neuro',    name: 'Neurología',        desc: 'Tratamiento del sistema nervioso',            specialists: 6,  icon: 'fa-brain',        bg: '#f3e8ff', color: '#a855f7', keywords: ['neurología','neuro','cerebro','neurólogo'] },
    { id: 'trauma',   name: 'Traumatología',     desc: 'Atención de huesos y articulaciones',         specialists: 10, icon: 'fa-bone',         bg: '#ffedd5', color: '#f97316', keywords: ['traumatología','trauma','huesos','articulaciones','traumatólogo'] },
    { id: 'oftal',    name: 'Oftalmología',      desc: 'Salud visual y cuidado de los ojos',          specialists: 5,  icon: 'fa-eye',          bg: '#ccfbf1', color: '#14b8a6', keywords: ['oftalmología','ojos','visión','oftalmólogo'] },
    { id: 'general',  name: 'Medicina General',  desc: 'Atención médica integral',                    specialists: 12, icon: 'fa-stethoscope',  bg: '#dbeafe', color: '#3b82f6', keywords: ['general','medicina general','médico general'] },
    { id: 'pedia',    name: 'Pediatría',         desc: 'Cuidado especializado para niños',            specialists: 9,  icon: 'fa-face-smile',   bg: '#fce7f3', color: '#ec4899', keywords: ['pediatría','pediatra','niños','bebé','pediatría'] },
];

const DOCTORS = {
    cardio:  [{ name: 'Dr. Carlos Mendoza',  rating: 4.9, exp: '15 años', icon: 'fa-user-doctor', slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM'] }, { name: 'Dra. Ana Torres',       rating: 4.8, exp: '12 años', icon: 'fa-user-nurse',  slots: ['08:00 AM','03:00 PM','04:00 PM'] }],
    neuro:   [{ name: 'Dr. Luis Paredes',    rating: 4.7, exp: '10 años', icon: 'fa-user-doctor', slots: ['10:00 AM','01:00 PM','04:00 PM'] }, { name: 'Dra. Sofía Rojas',      rating: 4.9, exp: '18 años', icon: 'fa-user-nurse',  slots: ['09:00 AM','11:00 AM'] }],
    trauma:  [{ name: 'Dr. Raúl Vásquez',   rating: 4.8, exp: '14 años', icon: 'fa-user-doctor', slots: ['08:00 AM','09:00 AM','02:00 PM','05:00 PM'] }, { name: 'Dra. Marta Quispe',     rating: 4.6, exp: '9 años',  icon: 'fa-user-nurse',  slots: ['11:00 AM','03:00 PM'] }],
    oftal:   [{ name: 'Dr. Pablo Salas',    rating: 4.8, exp: '11 años', icon: 'fa-user-doctor', slots: ['09:00 AM','10:00 AM','12:00 PM'] }, { name: 'Dra. Carmen Díaz',      rating: 4.7, exp: '8 años',  icon: 'fa-user-nurse',  slots: ['02:00 PM','04:00 PM'] }],
    general: [{ name: 'Dr. Jorge Ramos',    rating: 4.9, exp: '20 años', icon: 'fa-user-doctor', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM'] }, { name: 'Dra. Lucía Flores',     rating: 4.8, exp: '13 años', icon: 'fa-user-nurse',  slots: ['03:00 PM','04:00 PM','05:00 PM'] }],
    pedia:   [{ name: 'Dra. Valeria Castro',rating: 5.0, exp: '16 años', icon: 'fa-user-nurse',  slots: ['09:00 AM','10:30 AM','12:00 PM'] }, { name: 'Dr. Andrés León',       rating: 4.7, exp: '7 años',  icon: 'fa-user-doctor', slots: ['02:00 PM','03:30 PM','04:30 PM'] }],
};

// ── View ──────────────────────────────────────────────────────
export class BookingView {
    constructor(container, userName, onComplete) {
        this.userName = userName;
        this.onComplete = onComplete;
        this.ai = new AIAssistService();
    }

    render() {
        // Full page takeover — replaces the verification layout
        document.body.innerHTML = this._buildShell();
        this._attachEvents();
        // Fase 1 — greeting + listening
        setTimeout(() => {
            this.ai.greet(this.userName);
            this._updateBubble(`Hola ${this.userName} 👋 ¿Qué especialidad necesitas?`, true);
            setTimeout(() => this._startListening(), 5000);
        }, 700);
    }

    // ── Layout shell ──────────────────────────────────────────
    _buildShell() {
        return `
        <!DOCTYPE html>
        <div class="bk-wrapper">
            <!-- Header -->
            <header class="bk-header">
                <div class="bk-header-left">
                    <button class="bk-back-btn" id="btn-back" title="Volver">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="logo">
                        <div class="logo-box"><i class="fas fa-shield-halved"></i></div>
                        <span>Clinicla</span>
                    </div>
                </div>
                <div class="header-meta">
                    <i class="far fa-calendar-alt"></i>
                    <span>Reservación de Citas</span>
                </div>
            </header>

            <!-- Dynamic content -->
            <main class="bk-main" id="bk-content">
                ${this._buildSpecialtyGrid()}
            </main>

            <!-- AI Floating Assistant -->
            <div class="ai-floating" id="ai-floating">
                <div class="ai-speech-bubble" id="ai-bubble" style="display:none;"></div>
                <button class="ai-btn" id="ai-mic-btn" title="Hablar con IA">
                    <i class="fas fa-microphone" id="ai-mic-icon"></i>
                </button>
            </div>
        </div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            ${this._bookingStyles()}
        </style>`;
    }

    // ── Specialty Grid (Fase 1) ───────────────────────────────
    _buildSpecialtyGrid() {
        return `
        <div class="bk-container fade-in">
            <div class="bk-title-area">
                <h1>Selecciona el Área Médica</h1>
                <p>Elige la especialidad que necesitas para tu consulta</p>
            </div>
            <div class="specialty-grid">
                ${SPECIALTIES.map(s => this._buildSpecialtyCard(s)).join('')}
            </div>
        </div>`;
    }

    _buildSpecialtyCard(s) {
        return `
        <div class="specialty-card" data-id="${s.id}" tabindex="0" role="button" aria-label="${s.name}">
            <div class="spec-icon" style="background:${s.bg}; color:${s.color};">
                <i class="fas ${s.icon}"></i>
            </div>
            <div>
                <h3 class="spec-name">${s.name}</h3>
                <p class="spec-desc">${s.desc}</p>
            </div>
            <div class="spec-footer">
                <span>${s.specialists} especialistas</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>`;
    }

    // ── Events ────────────────────────────────────────────────
    _attachEvents() {
        document.getElementById('btn-back')?.addEventListener('click', () => location.reload());
        document.getElementById('ai-mic-btn')?.addEventListener('click', () => this._startListening());
        document.querySelectorAll('.specialty-card').forEach(card => {
            card.addEventListener('click', () => {
                const spec = SPECIALTIES.find(s => s.id === card.dataset.id);
                if (spec) this._selectSpecialty(spec);
            });
        });
    }

    // ── AI Voice ──────────────────────────────────────────────
    _startListening() {
        this._updateBubble('🎙️ Escuchando... di la especialidad que necesitas', true);
        this.ai.startListening(
            (transcript) => {
                this._updateBubble(`Escuché: "${transcript}"`, false);
                const match = this.ai.matchSpecialty(transcript, SPECIALTIES);
                if (match) {
                    setTimeout(() => this._selectSpecialty(match), 600);
                } else {
                    setTimeout(() => this._updateBubble('No encontré esa especialidad. Intenta de nuevo.', false), 200);
                }
            },
            () => this._hideBubble()
        );
    }

    _updateBubble(text, listening) {
        const bubble = document.getElementById('ai-bubble');
        const btn = document.getElementById('ai-mic-btn');
        const icon = document.getElementById('ai-mic-icon');
        if (!bubble) return;
        bubble.style.display = 'block';
        bubble.innerHTML = `<i class="fas fa-robot" style="color:#3b82f6; margin-right:8px;"></i>${text}`;
        if (btn) btn.classList.toggle('listening', listening);
        if (icon) { icon.className = listening ? 'fas fa-circle-dot' : 'fas fa-microphone'; }
    }

    _hideBubble() {
        const bubble = document.getElementById('ai-bubble');
        const btn = document.getElementById('ai-mic-btn');
        if (bubble) bubble.style.display = 'none';
        if (btn) btn.classList.remove('listening');
    }

    // ── Fase 1 → 2 ───────────────────────────────────────────
    _selectSpecialty(spec) {
        this.ai.stopListening();
        this.ai.confirmSpecialty(spec.name);
        this._highlightCard(spec.id);
        this._updateBubble(`Buscando especialistas en ${spec.name}...`, false);
        setTimeout(() => this._showAnalysis(spec), 1200);
    }

    _highlightCard(id) {
        document.querySelectorAll('.specialty-card').forEach(c => {
            c.style.opacity = c.dataset.id === id ? '1' : '0.4';
            if (c.dataset.id === id) c.style.border = '2px solid #3b82f6';
        });
    }

    // ── Fase 2: Análisis ──────────────────────────────────────
    _showAnalysis(spec) {
        const content = document.getElementById('bk-content');
        content.innerHTML = `
        <div class="bk-container fade-in" style="text-align:center; padding-top:60px;">
            <div class="analysis-badge" style="background:${spec.bg};">
                <i class="fas ${spec.icon}" style="color:${spec.color}; font-size:2.5rem;"></i>
            </div>
            <h2 style="margin:20px 0 8px;">${spec.name}</h2>
            <p style="color:var(--text-muted); margin-bottom:40px;">Analizando disponibilidad y coincidencias...</p>
            <div class="analysis-steps">
                <div class="step-item" id="step-1"><i class="fas fa-history"></i> Revisando historial médico</div>
                <div class="step-item" id="step-2"><i class="fas fa-brain"></i> Analizando preferencias</div>
                <div class="step-item" id="step-3"><i class="fas fa-star"></i> Calculando mejor match</div>
            </div>
        </div>`;

        this._animateSteps(() => this._showDoctors(spec));
    }

    _animateSteps(callback) {
        const steps = ['step-1', 'step-2', 'step-3'];
        steps.forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.classList.add('done');
            }, (i + 1) * 900);
        });
        setTimeout(callback, steps.length * 900 + 600);
    }

    // ── Fase 3: Recomendación ─────────────────────────────────
    _showDoctors(spec) {
        const doctors = DOCTORS[spec.id] || [];
        const content = document.getElementById('bk-content');
        content.innerHTML = `
        <div class="bk-container fade-in">
            <div class="bk-title-area">
                <button class="inline-back" id="btn-back-spec" style="margin-bottom:16px;">
                    <i class="fas fa-arrow-left"></i> ${spec.name}
                </button>
                <h1>Doctores Recomendados</h1>
                <p>Seleccionados según tu historial y disponibilidad</p>
            </div>
            <div class="doctor-list">
                ${doctors.map((d, i) => this._buildDoctorCard(d, i, spec)).join('')}
            </div>
        </div>`;

        document.getElementById('btn-back-spec')?.addEventListener('click', () => {
            const content = document.getElementById('bk-content');
            content.innerHTML = this._buildSpecialtyGrid();
            document.querySelectorAll('.specialty-card').forEach(card => {
                card.addEventListener('click', () => {
                    const s = SPECIALTIES.find(sp => sp.id === card.dataset.id);
                    if (s) this._selectSpecialty(s);
                });
            });
        });

        document.querySelectorAll('.slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const di = parseInt(btn.dataset.doctor);
                const time = btn.dataset.time;
                this._confirmAppointment(doctors[di], spec, time);
            });
        });

        this._updateBubble(`Encontré ${doctors.length} especialistas en ${spec.name} para ti 🎯`, false);
    }

    _buildDoctorCard(d, index, spec) {
        const stars = '★'.repeat(Math.floor(d.rating)) + (d.rating % 1 ? '½' : '');
        return `
        <div class="doctor-card">
            <div class="doctor-info">
                <div class="doctor-avatar" style="background:#eff6ff; color:#3b82f6;">
                    <i class="fas ${d.icon}"></i>
                </div>
                <div>
                    <h3 style="font-weight:700;">${d.name}</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${spec.name} · ${d.exp} de experiencia</p>
                    <p style="font-size:0.85rem; color:#f59e0b;">${stars} <span style="color:var(--text-muted);">(${d.rating})</span></p>
                </div>
            </div>
            <div class="slots-area">
                <p style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:10px;">HORARIOS DISPONIBLES</p>
                <div class="slots-grid">
                    ${d.slots.map(t => `<button class="slot-btn" data-doctor="${index}" data-time="${t}">${t}</button>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // ── Final: Confirmar cita ─────────────────────────────────
    _confirmAppointment(doctor, spec, time) {
        const content = document.getElementById('bk-content');
        const now = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
        content.innerHTML = `
        <div class="bk-container fade-in" style="max-width:600px;">
            <div style="text-align:center; margin-bottom:40px;">
                <div style="width:90px;height:90px;background:#dcfce7;border-radius:50%;display:flex;justify-content:center;align-items:center;margin:0 auto 20px;">
                    <i class="fas fa-check-circle" style="font-size:3rem;color:#16a34a;"></i>
                </div>
                <h1 style="font-size:1.8rem; margin-bottom:8px;">¡Cita Reservada!</h1>
                <p style="color:var(--text-muted);">Tu turno ha sido procesado por ClinicIA</p>
            </div>
            <div class="confirm-table">
                <div class="confirm-row"><span>Paciente</span><strong>${this.userName}</strong></div>
                <div class="confirm-row"><span>Médico</span><strong>${doctor.name}</strong></div>
                <div class="confirm-row"><span>Especialidad</span><strong>${spec.name}</strong></div>
                <div class="confirm-row"><span>Fecha</span><strong>${now}</strong></div>
                <div class="confirm-row"><span>Hora</span><strong>${time}</strong></div>
                <div class="confirm-row"><span>Consultorio</span><strong>302</strong></div>
            </div>
            <button class="bk-btn-primary" id="btn-new" style="margin-top:30px;">Nueva Verificación</button>
        </div>`;

        this.ai.announceDoctor(doctor.name, time, 'consultorio 302');
        this._hideBubble();
        document.getElementById('btn-new')?.addEventListener('click', () => location.reload());
    }

    // ── Styles ────────────────────────────────────────────────
    _bookingStyles() {
        return `
        * { margin:0; padding:0; box-sizing:border-box; }
        :root { --text-main:#1e293b; --text-muted:#64748b; --primary-blue:#3b82f6; --bg-light:#f0f7ff; }
        body { font-family:'Outfit',sans-serif; background:var(--bg-light); color:var(--text-main); margin:0; min-height:100vh; }
        .bk-wrapper { min-height:100vh; display:flex; flex-direction:column; }

        .bk-header { display:flex; justify-content:space-between; align-items:center; padding:18px 40px; background:#fff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; z-index:100; }
        .bk-header-left { display:flex; align-items:center; gap:16px; }
        .bk-back-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem; width:36px; height:36px; border-radius:8px; transition:all .2s; display:flex; align-items:center; justify-content:center; }
        .bk-back-btn:hover { background:#f1f5f9; color:var(--primary-blue); }
        .logo { display:flex; align-items:center; gap:10px; font-size:1.3rem; font-weight:700; color:#1e40af; }
        .logo-box { width:30px; height:30px; background:var(--primary-blue); border-radius:8px; display:flex; justify-content:center; align-items:center; color:#fff; font-size:.9rem; }
        .header-meta { display:flex; align-items:center; gap:8px; color:var(--text-muted); font-size:.875rem; }

        .bk-main { flex:1; padding:20px 0 60px; }
        .bk-container { max-width:1100px; margin:0 auto; padding:40px 40px 0; }
        @media(max-width:640px) { .bk-container{padding:24px 20px 0;} .bk-header{padding:14px 20px;} }

        .bk-title-area { text-align:center; margin-bottom:40px; }
        .bk-title-area h1 { font-size:2rem; font-weight:800; margin-bottom:10px; }
        .bk-title-area p { color:var(--text-muted); font-size:1rem; }

        .specialty-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        @media(max-width:900px) { .specialty-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:560px) { .specialty-grid { grid-template-columns:1fr; } }

        .specialty-card { background:#fff; padding:28px; border-radius:16px; cursor:pointer; transition:all .3s; box-shadow:0 2px 8px rgba(0,0,0,.07); display:flex; flex-direction:column; gap:14px; border:1px solid transparent; }
        .specialty-card:hover { box-shadow:0 8px 24px rgba(59,130,246,.15); border-color:var(--primary-blue); transform:translateY(-4px); }
        .spec-icon { width:54px; height:54px; border-radius:14px; display:flex; justify-content:center; align-items:center; font-size:1.4rem; }
        .spec-name { font-weight:700; font-size:1.05rem; margin-bottom:4px; }
        .spec-desc { font-size:.85rem; color:var(--text-muted); }
        .spec-footer { display:flex; justify-content:space-between; align-items:center; color:var(--text-muted); font-size:.8rem; padding-top:8px; border-top:1px solid #f1f5f9; }

        /* Analysis */
        .analysis-badge { width:90px; height:90px; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 10px; }
        .analysis-steps { display:flex; flex-direction:column; gap:12px; max-width:360px; margin:0 auto; }
        .step-item { background:#fff; padding:14px 20px; border-radius:12px; display:flex; align-items:center; gap:12px; font-size:.95rem; color:var(--text-muted); border:2px solid transparent; transition:all .4s; }
        .step-item i { color:#cbd5e1; transition:color .4s; }
        .step-item.done { border-color:#22c55e; color:var(--text-main); }
        .step-item.done i { color:#22c55e; }

        /* Doctor list */
        .doctor-list { display:flex; flex-direction:column; gap:20px; }
        .doctor-card { background:#fff; border-radius:16px; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,.07); }
        .doctor-info { display:flex; gap:16px; align-items:flex-start; margin-bottom:20px; }
        .doctor-avatar { width:60px; height:60px; border-radius:14px; display:flex; justify-content:center; align-items:center; font-size:1.6rem; flex-shrink:0; }
        .slots-grid { display:flex; flex-wrap:wrap; gap:10px; }
        .slot-btn { padding:8px 16px; border:2px solid #e2e8f0; border-radius:8px; background:#fff; cursor:pointer; font-size:.85rem; font-weight:600; transition:all .2s; color:var(--text-main); }
        .slot-btn:hover { background:#eff6ff; border-color:var(--primary-blue); color:var(--primary-blue); }

        /* Confirm */
        .confirm-table { background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; }
        .confirm-row { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid #e2e8f0; font-size:.95rem; }
        .confirm-row:last-child { border-bottom:none; }
        .confirm-row span { color:var(--text-muted); }
        .bk-btn-primary { width:100%; padding:16px; border-radius:12px; background:linear-gradient(90deg,#3b82f6,#6366f1); color:#fff; border:none; font-size:1rem; font-weight:700; cursor:pointer; transition:all .3s; }
        .bk-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 20px rgba(59,130,246,.3); }
        .inline-back { background:none; border:none; color:var(--primary-blue); font-size:.95rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; }

        /* AI Bubble */
        .ai-floating { position:fixed; bottom:28px; right:28px; z-index:999; display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
        .ai-speech-bubble { background:#fff; border:1px solid #e2e8f0; border-radius:16px 16px 4px 16px; padding:12px 16px; font-size:.875rem; max-width:260px; box-shadow:0 4px 20px rgba(0,0,0,.1); line-height:1.5; animation:fadeIn .3s ease; }
        .ai-btn { width:58px; height:58px; background:linear-gradient(135deg,#3b82f6,#6366f1); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#fff; font-size:1.2rem; border:none; cursor:pointer; box-shadow:0 4px 15px rgba(59,130,246,.4); transition:all .3s; }
        .ai-btn.listening { animation:ai-pulse 1.2s infinite; }
        @keyframes ai-pulse { 0%{box-shadow:0 0 0 0 rgba(59,130,246,.7)} 70%{box-shadow:0 0 0 16px rgba(59,130,246,0)} 100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn .45s ease-out; }
        `;
    }
}
