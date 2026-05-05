import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, getAvailableSlots, bookAppointment } from '../api/api'

export default function BookAppointment() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [doctors, setDoctors] = useState([])
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    const [form, setForm] = useState({
        doctor: '',
        doctor_name: '',
        appointment_date: '',
        selected_slot: null,
        appointment_type: 'New',
        symptoms_notes: ''
    })

    useEffect(() => {
        getDoctors()
            .then(res => setDoctors(res.data.message || []))
            .catch(() => setError('Failed to load doctors.'))
    }, [])

    useEffect(() => {
        if (form.doctor && form.appointment_date) {
            setSlotsLoading(true)
            setSlots([])
            setForm(f => ({ ...f, selected_slot: null }))

            getAvailableSlots(form.doctor, form.appointment_date)
                .then(res => setSlots(res.data.message || []))
                .catch(() => setError('Failed to load slots.'))
                .finally(() => setSlotsLoading(false))
        }
    }, [form.doctor, form.appointment_date])

    const handleDoctorSelect = (doctor) => {
        setForm(f => ({
            ...f,
            doctor: doctor.name,
            doctor_name: doctor.doctor_name,
            selected_slot: null
        }))
        setStep(2)
    }

    const handleSlotSelect = (slot) => {
        setForm(f => ({ ...f, selected_slot: slot }))
        setStep(3)
    }

    const handleSubmit = async () => {
        if (!form.selected_slot) return
        setLoading(true)
        setError('')

        try {
            const res = await bookAppointment({
                doctor: form.doctor,
                doctor_schedule: form.selected_slot.schedule,
                appointment_date: form.appointment_date,
                from_time: form.selected_slot.from_time,
                appointment_type: form.appointment_type,
                symptoms_notes: form.symptoms_notes
            })
            setSuccess(res.data.message)
        } catch (err) {
            setError(
                err.response?.data?.exception ||
                'Booking failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={{ color: '#16a34a', marginBottom: '8px' }}>
                        Appointment Booked
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        Appointment ID: <strong>{success.appointment}</strong>
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        Consultation Fee: <strong>₹{success.fee}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/my-appointments')}
                            style={styles.button}
                        >
                            View My Appointments
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(null)
                                setStep(1)
                                setForm({
                                    doctor: '',
                                    doctor_name: '',
                                    appointment_date: '',
                                    selected_slot: null,
                                    appointment_type: 'new',
                                    symptoms_notes: ''
                                })
                            }}
                            style={styles.outlineButton}
                        >
                            Book Another
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h2 style={styles.title}>Book Appointment</h2>

                {/* Progress Steps */}
                <div style={styles.steps}>
                    {['Select Doctor', 'Pick Slot', 'Confirm'].map((s, i) => (
                        <div key={i} style={styles.stepItem}>
                            <div style={{
                                ...styles.stepCircle,
                                background: step > i + 1
                                    ? '#16a34a'
                                    : step === i + 1
                                        ? '#2563eb'
                                        : '#e2e8f0',
                                color: step >= i + 1 ? 'white' : '#94a3b8'
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{
                                fontSize: '12px',
                                color: step === i + 1 ? '#2563eb' : '#94a3b8',
                                fontWeight: step === i + 1 ? '600' : '400'
                            }}>
                                {s}
                            </span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={styles.errorBox}>{error}</div>
                )}

                {/* Step 1 — Select Doctor */}
                {step === 1 && (
                    <div>
                        <h3 style={styles.stepTitle}>Select a Doctor</h3>
                        {doctors.length === 0 ? (
                            <p style={{ color: '#64748b' }}>
                                No doctors available.
                            </p>
                        ) : (
                            <div style={styles.doctorGrid}>
                                {doctors.map(doc => (
                                    <div
                                        key={doc.name}
                                        onClick={() => handleDoctorSelect(doc)}
                                        style={{
                                            ...styles.doctorCard,
                                            border: form.doctor === doc.name
                                                ? '2px solid #2563eb'
                                                : '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div style={styles.doctorAvatar}>
                                            {doc.doctor_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={styles.doctorName}>
                                                {doc.doctor_name}
                                            </p>
                                            <p style={styles.doctorSpec}>
                                                {doc.specialization}
                                            </p>
                                            <p style={styles.doctorFee}>
                                                ₹{doc.consultation_fee}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2 — Pick Date and Slot */}
                {step === 2 && (
                    <div>
                        <button
                            onClick={() => setStep(1)}
                            style={styles.backButton}
                        >
                            ← Back
                        </button>

                        <h3 style={styles.stepTitle}>
                            Pick a Date and Time Slot
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '16px' }}>
                            Doctor: <strong>{form.doctor_name}</strong>
                        </p>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Appointment Date
                            </label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={form.appointment_date}
                                onChange={e => setForm(f => ({
                                    ...f,
                                    appointment_date: e.target.value
                                }))}
                                style={styles.input}
                            />
                        </div>

                        {slotsLoading && (
                            <p style={{ color: '#64748b' }}>
                                Loading available slots...
                            </p>
                        )}

                        {!slotsLoading && form.appointment_date && (
                            <>
                                {slots.length === 0 ? (
                                    <p style={{ color: '#ef4444' }}>
                                        No slots available for this date.
                                        Please try another date.
                                    </p>
                                ) : (
                                    <>
                                        <p style={styles.label}>
                                            Available Slots
                                            ({slots.length} available)
                                        </p>
                                        <div style={styles.slotGrid}>
                                            {slots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        handleSlotSelect(slot)
                                                    }
                                                    style={{
                                                        ...styles.slotButton,
                                                        background:
                                                            form.selected_slot
                                                            ?.from_time
                                                            === slot.from_time
                                                                ? '#2563eb'
                                                                : 'white',
                                                        color:
                                                            form.selected_slot
                                                            ?.from_time
                                                            === slot.from_time
                                                                ? 'white'
                                                                : '#374151'
                                                    }}
                                                >
                                                    {slot.from_time
                                                        .substring(0, 5)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Step 3 — Confirm */}
                {step === 3 && form.selected_slot && (
                    <div>
                        <button
                            onClick={() => setStep(2)}
                            style={styles.backButton}
                        >
                            ← Back
                        </button>

                        <h3 style={styles.stepTitle}>
                            Confirm Appointment
                        </h3>

                        <div style={styles.summaryCard}>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    Doctor
                                </span>
                                <span style={styles.summaryValue}>
                                    {form.doctor_name}
                                </span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    Date
                                </span>
                                <span style={styles.summaryValue}>
                                    {form.appointment_date}
                                </span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    Time
                                </span>
                                <span style={styles.summaryValue}>
                                    {form.selected_slot.from_time
                                        .substring(0, 5)}
                                </span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    Fee
                                </span>
                                <span style={{
                                    ...styles.summaryValue,
                                    color: '#2563eb',
                                    fontWeight: '600'
                                }}>
                                    ₹{form.selected_slot.consultation_fee}
                                </span>
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Appointment Type
                            </label>
                            <select
    value={form.appointment_type}
    onChange={e => setForm(f => ({
        ...f,
        appointment_type: e.target.value
    }))}
    style={styles.input}
>
    <option value="new">New</option>
    <option value="follow-up">Follow-up</option>
    <option value="emergency">Emergency</option>
</select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Symptoms / Notes (optional)
                            </label>
                            <textarea
                                rows={3}
                                value={form.symptoms_notes}
                                onChange={e => setForm(f => ({
                                    ...f,
                                    symptoms_notes: e.target.value
                                }))}
                                style={{
                                    ...styles.input,
                                    resize: 'vertical'
                                }}
                                placeholder="Describe your symptoms..."
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                ...styles.button,
                                width: '100%',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading
                                ? 'Booking...'
                                : 'Confirm Booking'
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '90vh',
        background: '#f1f5f9',
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'center'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        border: '1px solid #e2e8f0',
        height: 'fit-content'
    },
    successCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '48px 32px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
        margin: 'auto'
    },
    successIcon: {
        width: '64px',
        height: '64px',
        background: '#dcfce7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        color: '#16a34a',
        margin: '0 auto 16px'
    },
    title: {
        margin: '0 0 24px',
        fontSize: '22px',
        fontWeight: '600',
        color: '#1e293b'
    },
    steps: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '28px',
        position: 'relative'
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        flex: 1
    },
    stepCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '600'
    },
    stepTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px'
    },
    errorBox: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    doctorGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    doctorCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    doctorAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#dbeafe',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: '600',
        flexShrink: 0
    },
    doctorName: {
        margin: 0,
        fontWeight: '600',
        color: '#1e293b',
        fontSize: '15px'
    },
    doctorSpec: {
        margin: '2px 0 0',
        color: '#64748b',
        fontSize: '13px'
    },
    doctorFee: {
        margin: '4px 0 0',
        color: '#2563eb',
        fontSize: '13px',
        fontWeight: '500'
    },
    slotGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '8px',
        marginTop: '8px'
    },
    slotButton: {
        padding: '10px 8px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    },
    summaryCard: {
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #e2e8f0'
    },
    summaryLabel: {
        color: '#64748b',
        fontSize: '14px'
    },
    summaryValue: {
        color: '#1e293b',
        fontSize: '14px',
        fontWeight: '500'
    },
    field: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    button: {
        padding: '12px 24px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    outlineButton: {
        padding: '12px 24px',
        background: 'white',
        color: '#2563eb',
        border: '1px solid #2563eb',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '0 0 16px 0'
    }
}