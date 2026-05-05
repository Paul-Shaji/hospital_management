import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerPatient, login } from '../api/api'

export default function Register({ setUser }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        patient_full_name: '',
        date_of_birth: '',
        gender: '',
        mobile_no: '',
        email: '',
        password: '',
        blood_group: '',
        address: ''
    })

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await registerPatient(form)
            await login(form.email, form.password)
            setUser(form.email)
            navigate('/book-appointment')
        } catch (err) {
            setError(
                err.response?.data?.exception ||
                'Registration failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Patient Registration</h2>
                <p style={styles.subtitle}>
                    Create your account to book appointments
                </p>

                {error && (
                    <div style={styles.errorBox}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>

                    <div style={styles.field}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            name="patient_full_name"
                            value={form.patient_full_name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="John Smith"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Date of Birth *</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={form.date_of_birth}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Gender *</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Mobile Number *</label>
                        <input
                            type="tel"
                            name="mobile_no"
                            value={form.mobile_no}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="9876543210"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Create a password"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Blood Group</label>
                            <select
                                name="blood_group"
                                value={form.blood_group}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="">Select</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>O+</option>
                                <option>O-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows={3}
                            style={{ ...styles.input, resize: 'vertical' }}
                            placeholder="Your address"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already registered?{' '}
                    <Link to="/login" style={styles.link}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
        padding: '24px'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '520px',
        border: '1px solid #e2e8f0'
    },
    title: {
        margin: '0 0 8px',
        fontSize: '24px',
        fontWeight: '600',
        color: '#1e293b'
    },
    subtitle: {
        margin: '0 0 24px',
        color: '#64748b',
        fontSize: '14px'
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
    row: {
        display: 'flex',
        gap: '12px'
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
        width: '100%',
        padding: '12px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '8px'
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        color: '#64748b'
    },
    link: {
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: '500'
    }
}