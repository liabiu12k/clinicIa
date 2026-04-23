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
        <div class="bk-container fade-in">
            <div class="split-layout">
                <!-- Left: specialty info -->
                <div class="split-left" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
                    <div class="analysis-badge" style="background:${spec.bg};">
                        <i class="fas ${spec.icon}" style="color:${spec.color}; font-size:3rem;"></i>
                    </div>
                    <h2 style="margin:24px 0 10px;font-size:clamp(1.4rem,2.5vw,2rem);">${spec.name}</h2>
                    <p style="color:var(--text-muted);font-size:1rem;">Sistema analizando las mejores opciones para ti</p>
                </div>
                <!-- Right: steps -->
                <div class="split-right" style="display:flex;flex-direction:column;justify-content:center;gap:16px;">
                    <p style="font-weight:700;font-size:.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">PROCESO DE ANÁLISIS</p>
                    <div class="step-item" id="step-1"><i class="fas fa-history"></i> Revisando historial médico</div>
                    <div class="step-item" id="step-2"><i class="fas fa-brain"></i> Analizando preferencias</div>
                    <div class="step-item" id="step-3"><i class="fas fa-star"></i> Calculando mejor match</div>
                </div>
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
        <div class="bk-container fade-in">
            <div class="split-layout">
                <!-- Left: success message -->
                <div class="split-left" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
                    <div style="width:110px;height:110px;background:#dcfce7;border-radius:50%;display:flex;justify-content:center;align-items:center;margin-bottom:24px;">
                        <i class="fas fa-check-circle" style="font-size:3.5rem;color:#16a34a;"></i>
                    </div>
                    <h1 style="font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:12px;">¡Cita Reservada!</h1>
                    <p style="color:var(--text-muted);margin-bottom:24px;">Tu turno ha sido procesado por ClinicIA</p>
                    <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px;">
                        <div style="background:#eff6ff;padding:14px 18px;border-radius:10px;display:flex;align-items:center;gap:12px;text-align:left;">
                            <i class="fas fa-bell" style="color:#3b82f6;"></i>
                            <span style="font-size:.875rem;color:#1d4ed8;">Recordatorio enviado a tu móvil</span>
                        </div>
                        <div style="background:#f0fdf4;padding:14px 18px;border-radius:10px;display:flex;align-items:center;gap:12px;text-align:left;">
                            <i class="fas fa-map-marker-alt" style="color:#16a34a;"></i>
                            <span style="font-size:.875rem;color:#15803d;">Consultorio 302 — Piso 3</span>
                        </div>
                    </div>
                </div>
                <!-- Right: appointment details -->
                <div class="split-right" style="display:flex;flex-direction:column;justify-content:center;">
                    <p style="font-weight:700;font-size:.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px;">DETALLES DE LA CITA</p>
                    <div class="confirm-table" style="margin-bottom:24px;">
                        <div class="confirm-row"><span>Paciente</span><strong>${this.userName}</strong></div>
                        <div class="confirm-row"><span>Médico</span><strong>${doctor.name}</strong></div>
                        <div class="confirm-row"><span>Especialidad</span><strong>${spec.name}</strong></div>
                        <div class="confirm-row"><span>Fecha</span><strong>${now}</strong></div>
                        <div class="confirm-row"><span>Hora</span><strong>${time}</strong></div>
                        <div class="confirm-row"><span>Consultorio</span><strong>302</strong></div>
                    </div>
                    <button class="bk-btn-primary" id="btn-new">Nueva Verificación</button>
                </div>
            </div>
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
        body { font-family:'Outfit',sans-serif; background:var(--bg-light); color:var(--text-main); margin:0; min-height:100vh; -webkit-font-smoothing:antialiased; }
        .bk-wrapper { min-height:100vh; display:flex; flex-direction:column; }

        /* ── Header ── */
        .bk-header { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:#fff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; z-index:100; }
        .bk-header-left { display:flex; align-items:center; gap:14px; }
        .bk-back-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem; width:40px; height:40px; border-radius:8px; transition:all .2s; display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; }
        .bk-back-btn:hover { background:#f1f5f9; color:var(--primary-blue); }
        .logo { display:flex; align-items:center; gap:10px; font-size:1.25rem; font-weight:700; color:#1e40af; }
        .logo-box { width:30px; height:30px; background:var(--primary-blue); border-radius:8px; display:flex; justify-content:center; align-items:center; color:#fff; font-size:.85rem; flex-shrink:0; }
        .header-meta { display:flex; align-items:center; gap:8px; color:var(--text-muted); font-size:.85rem; }

        /* ── Layout ── */
        .bk-main { flex:1; display:flex; flex-direction:column; padding:0 0 80px; }
        .bk-container { width:100%; padding:40px clamp(20px,4vw,60px) 0; }
        .bk-title-area { text-align:center; margin-bottom:40px; }
        .bk-title-area h1 { font-size:clamp(1.4rem,3vw,2.2rem); font-weight:800; margin-bottom:10px; }
        .bk-title-area p  { color:var(--text-muted); font-size:clamp(.875rem,1.5vw,1.05rem); }

        /* ── Specialty grid — fills available width ── */
        .specialty-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(14px,2vw,24px); }
        .specialty-card { background:#fff; padding:24px; border-radius:16px; cursor:pointer; transition:transform .25s,box-shadow .25s,border-color .25s; box-shadow:0 2px 8px rgba(0,0,0,.07); display:flex; flex-direction:column; gap:14px; border:2px solid transparent; -webkit-tap-highlight-color:transparent; user-select:none; }
        .specialty-card:hover  { box-shadow:0 8px 24px rgba(59,130,246,.15); border-color:var(--primary-blue); transform:translateY(-4px); }
        .specialty-card:active { transform:scale(.97); }
        .spec-icon   { width:52px; height:52px; border-radius:14px; display:flex; justify-content:center; align-items:center; font-size:1.35rem; flex-shrink:0; }
        .spec-name   { font-weight:700; font-size:1rem; margin-bottom:4px; }
        .spec-desc   { font-size:.82rem; color:var(--text-muted); line-height:1.4; }
        .spec-footer { display:flex; justify-content:space-between; align-items:center; color:var(--text-muted); font-size:.78rem; padding-top:10px; border-top:1px solid #f1f5f9; margin-top:auto; }

        /* ── Analysis ── */
        .analysis-badge { width:100px; height:100px; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 10px; }
        .analysis-steps { display:flex; flex-direction:column; gap:12px; width:100%; }
        .step-item      { background:#fff; padding:14px 20px; border-radius:12px; display:flex; align-items:center; gap:12px; font-size:.95rem; color:var(--text-muted); border:2px solid transparent; transition:all .4s; }
        .step-item i    { color:#cbd5e1; transition:color .4s; }
        .step-item.done { border-color:#22c55e; color:var(--text-main); }
        .step-item.done i { color:#22c55e; }

        /* ── Split layout (2-col on desktop) ── */
        .split-layout { display:grid; grid-template-columns:1fr 1fr; gap:clamp(24px,4vw,60px); min-height:calc(100vh - 140px); align-items:center; }
        .split-left   { padding:clamp(20px,4vw,48px); }
        .split-right  { padding:clamp(20px,4vw,48px); }

        /* ── Doctor list ── */
        .doctor-list   { display:flex; flex-direction:column; gap:20px; }
        .doctor-card   { background:#fff; border-radius:16px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,.07); }
        .doctor-info   { display:flex; gap:16px; align-items:flex-start; margin-bottom:20px; }
        .doctor-avatar { width:58px; height:58px; border-radius:14px; display:flex; justify-content:center; align-items:center; font-size:1.5rem; flex-shrink:0; background:#eff6ff; color:#3b82f6; }
        .slots-grid    { display:flex; flex-wrap:wrap; gap:10px; }
        .slot-btn      { min-height:44px; padding:8px 16px; border:2px solid #e2e8f0; border-radius:8px; background:#fff; cursor:pointer; font-size:.875rem; font-weight:600; font-family:'Outfit',sans-serif; transition:all .2s; color:var(--text-main); -webkit-tap-highlight-color:transparent; }
        .slot-btn:hover  { background:#eff6ff; border-color:var(--primary-blue); color:var(--primary-blue); }
        .slot-btn:active { transform:scale(.95); }

        /* ── Confirm ── */
        .confirm-table          { background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; }
        .confirm-row            { display:flex; justify-content:space-between; align-items:center; padding:13px 20px; border-bottom:1px solid #e2e8f0; font-size:.9rem; gap:12px; }
        .confirm-row:last-child { border-bottom:none; }
        .confirm-row span       { color:var(--text-muted); flex-shrink:0; }
        .confirm-row strong     { text-align:right; word-break:break-word; }
        .bk-btn-primary  { min-height:52px; width:100%; padding:14px; border-radius:12px; background:linear-gradient(90deg,#3b82f6,#6366f1); color:#fff; border:none; font-size:1rem; font-weight:700; cursor:pointer; transition:all .3s; font-family:'Outfit',sans-serif; -webkit-tap-highlight-color:transparent; }
        .bk-btn-primary:hover  { transform:translateY(-2px); box-shadow:0 10px 20px rgba(59,130,246,.3); }
        .bk-btn-primary:active { transform:scale(.98); }
        .inline-back { background:none; border:none; color:var(--primary-blue); font-size:.95rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0; font-family:'Outfit',sans-serif; }

        /* ── AI Floating ── */
        .ai-floating      { position:fixed; bottom:24px; right:20px; z-index:999; display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
        .ai-speech-bubble { background:#fff; border:1px solid #e2e8f0; border-radius:16px 16px 4px 16px; padding:12px 16px; font-size:.85rem; max-width:240px; box-shadow:0 4px 20px rgba(0,0,0,.1); line-height:1.5; animation:fadeIn .3s ease; }
        .ai-btn           { width:54px; height:54px; background:linear-gradient(135deg,#3b82f6,#6366f1); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#fff; font-size:1.1rem; border:none; cursor:pointer; box-shadow:0 4px 15px rgba(59,130,246,.4); transition:all .3s; -webkit-tap-highlight-color:transparent; }
        .ai-btn.listening { animation:ai-pulse 1.2s infinite; }

        @keyframes ai-pulse { 0%{box-shadow:0 0 0 0 rgba(59,130,246,.7)} 70%{box-shadow:0 0 0 16px rgba(59,130,246,0)} 100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn .45s ease-out; }

        /* ============================================================
           RESPONSIVE — BOOKING FLOW
        ============================================================ */

        /* Tablet landscape (≤ 1024px) */
        @media (max-width:1024px) {
            .bk-container { padding:32px 28px 0; }
            .bk-header    { padding:14px 28px; }
        }

        /* Tablet portrait (≤ 768px) → 2-col grid */
        @media (max-width:768px) {
            .specialty-grid  { grid-template-columns:repeat(2,1fr); gap:16px; }
            .bk-container    { padding:24px 20px 0; }
            .bk-title-area   { margin-bottom:24px; }
            .doctor-card     { padding:18px; }
            .analysis-steps  { max-width:100%; }
            .ai-speech-bubble{ max-width:200px; }
        }

        /* Mobile large (≤ 560px) → 1-col grid, horizontal card layout */
        @media (max-width:560px) {
            .specialty-grid  { grid-template-columns:1fr; gap:10px; }
            .specialty-card  { flex-direction:row; align-items:center; padding:16px 18px; gap:14px; }
            .specialty-card:hover { transform:none; box-shadow:0 2px 8px rgba(0,0,0,.07); }
            .spec-icon       { width:44px; height:44px; font-size:1.1rem; }
            .spec-footer     { margin-top:0; padding-top:0; border-top:none; justify-content:flex-start; gap:8px; }
            .bk-title-area h1{ font-size:1.3rem; }
            .bk-main         { padding-bottom:120px; }
        }

        /* Mobile small (≤ 400px) */
        @media (max-width:400px) {
            .bk-header       { padding:12px 14px; }
            .logo            { font-size:1.05rem; }
            .header-meta span{ display:none; }
            .bk-container    { padding:18px 14px 0; }
            .doctor-info     { flex-direction:column; }
            .doctor-avatar   { width:50px; height:50px; font-size:1.3rem; }
            .slots-grid      { gap:8px; }
            .slot-btn        { padding:8px 12px; font-size:.8rem; }
            .ai-floating     { bottom:14px; right:12px; }
            .ai-btn          { width:48px; height:48px; }
            .ai-speech-bubble{ display:none !important; }
            .confirm-row     { padding:11px 14px; flex-direction:column; align-items:flex-start; gap:2px; }
            .confirm-row strong { text-align:left; }
        }

        /* Split layout — tablet stacks to 1 column */
        @media (max-width:768px) {
            .split-layout { grid-template-columns:1fr; min-height:auto; gap:16px; }
            .split-left   { padding:24px 0 8px; }
            .split-right  { padding:8px 0 24px; }
        }
        `;
    }
}
