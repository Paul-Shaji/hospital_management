import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/api'

export default function Login({ setUser }) {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)
    
        try {
            const res = await login(form.email, form.password)
            console.log('Login response:', res)
    
            // Frappe returns "No App" or "Logged In" on success
            if (
                res.data.message === 'No App' ||
                res.data.message === 'Logged In' ||
                res.data.full_name
            ) {
                setUser(form.email)
                navigate('/my-appointments')
            } else {
                setError('Login failed. Please try again.')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Patient Login</h2>
                <p style={styles.subtitle}>
                    Welcome back. Login to manage your appointments.
                </p>

                {error && (
                    <div style={styles.errorBox}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email Address</label>
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
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    New patient?{' '}
                    <Link to="/register" style={styles.link}>
                        Register here
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
        maxWidth: '420px',
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