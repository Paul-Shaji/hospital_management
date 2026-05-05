async function postForm(url, data) {
    const formData = new URLSearchParams()
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formData.append(key, String(data[key]))
        }
    })

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Frappe-CSRF-Token': 'fetch'
        },
        body: formData.toString()
    })

    const json = await response.json()

    if (!response.ok) {
        throw { response: { data: json, status: response.status } }
    }

    return { data: json }
}

async function getRequest(url, params = {}) {
    const query = new URLSearchParams(params).toString()
    const fullUrl = url + (query ? '?' + query : '')

    const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include'
    })

    const json = await response.json()

    if (!response.ok) {
        throw { response: { data: json, status: response.status } }
    }

    return { data: json }
}


// ── Auth ─────────────────────────────────────────────────

export const getLoggedInUser = () =>
    getRequest('/api/method/frappe.auth.get_logged_user')

export const login = (email, password) =>
    postForm('/api/method/login', {
        usr: email,
        pwd: password
    })

export const logout = () =>
    getRequest('/api/method/logout')


// ── Patient ──────────────────────────────────────────────

export const registerPatient = (data) =>
    postForm(
        '/api/method/hospital_management.api.register_patient',
        data
    )

export const getPatientDetails = () =>
    getRequest('/api/method/hospital_management.api.get_patient_details')


// ── Doctors ──────────────────────────────────────────────

export const getDoctors = () =>
    getRequest('/api/method/hospital_management.api.get_doctors')


// ── Slots ────────────────────────────────────────────────

export const getAvailableSlots = (doctor, appointment_date) =>
    getRequest(
        '/api/method/hospital_management.api.get_available_slots',
        { doctor, appointment_date }
    )


// ── Appointments ─────────────────────────────────────────

export const bookAppointment = (data) =>
    postForm(
        '/api/method/hospital_management.api.book_appointment',
        data
    )

export const getMyAppointments = () =>
    getRequest('/api/method/hospital_management.api.get_my_appointments')

export const cancelAppointment = (name) =>
    postForm(
        '/api/method/hospital_management.api.cancel_appointment',
        { name }
    )