const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (res.status === 403) throw new Error("Account pending administrative approval. Please wait for an Admin to verify your credentials.");
    if (!res.ok) throw new Error("Invalid credentials or server error.");
    return res.text();
};

export const approveUser = async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/approve`, { method: 'PUT' });
    return res.json();
};

export const deleteUser = async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    return res.ok;
};

export const getPatientAppointments = async (patientId) => {
    try {
        const res = await fetch(`${API_BASE}/appointments/patient/${patientId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch(e) { return []; }
};

export const getDoctorConsultations = async (doctorId) => {
    try {
        const res = await fetch(`${API_BASE}/appointments/doctor/${doctorId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch(e) { return []; }
};

export const getPatientRecords = async (patientId) => {
    try {
        const res = await fetch(`${API_BASE}/records/patient/${patientId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch(e) { return []; }
};

export const getAllPrescriptions = async () => {
    try {
        const res = await fetch(`${API_BASE}/prescriptions`);
        if (!res.ok) return [];
        return await res.json();
    } catch(e) { return []; }
};

export const fulfillPrescription = async (id) => {
    const res = await fetch(`${API_BASE}/prescriptions/${id}/fulfill`, { method: 'PUT' });
    return res.json();
};

export const getAllUsers = async () => {
    try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) return [];
        return await res.json();
    } catch(e) { return []; }
};

export const createAppointment = async (appt) => {
    const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt)
    });
    return res.json();
};

export const issuePrescription = async (prescription) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription)
    });
    return res.json();
};

export const addMedicalRecord = async (record) => {
    const res = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    });
    return res.json();
};

export const cancelAppointment = async (id) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
    return res.ok;
};
