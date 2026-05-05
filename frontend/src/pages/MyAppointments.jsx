import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyAppointments, cancelAppointment } from '../api/api'

const STATUS_COLORS = {
    Booked:    { bg: '#dbeafe', color: '#1d4ed8' },
    Confirmed: { bg: '#dcfce7', color: '#15803d' },
    Completed: { bg: '#f0fdf4', color: '#166534' },
    Cancelled: { bg: '#fee2e2', color: '#dc2626' },
    'No-Show': { bg: '#fef9c3', color: '#854d0e' }
}

const PAYMENT_COLORS = {
    Unpaid:   { bg: '#fef2f2', color: '#dc2626' },
    Paid:     { bg: '#dcfce7', color: '#15803d' },
    Waived:   { bg: '#f0f9ff', color: '#0369a1' },
    Refunded: { bg: '#faf5ff', color: '#7c3aed' }
}

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancelling, setCancelling] = useState(null)

    const fetchAppointments = () => {
        setLoading(true)
        getMyAppointments()
            .then(res => {
                setAppointments(res.data.message || [])
            })
            .catch(err => {
                console.error('Appointments error:', err)
                setError(
                    err.response?.data?.exception ||
                    err.response?.data?._server_messages ||
                    'Failed to load appointments.'
                )
            })
            .finally(() => setLoading(false))
    }
    useEffect(() => {
        fetchAppointments()
    }, [])

    const handleCancel = async (name) => {
        if (!window.confirm(
            'Are you sure you want to cancel this appointment?'
        )) return

        setCancelling(name)
        try {
            await cancelAppointment(name)
            fetchAppointments()
        } catch (err) {
            setError(
                err.response?.data?.exception ||
                'Failed to cancel appointment.'
            )
        } finally {
            setCancelling(null)
        }
    }

    if (loading) return (
        <div style={styles.center}>
            Loading your appointments...
        </div>
    )

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>My Appointments</h2>
                    <p style={styles.subtitle}>
                        {appointments.length} appointment
                        {appointments.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <Link to="/book-appointment" style={styles.bookButton}>
                    + Book New
                </Link>
            </div>

            {error && (
                <div style={styles.errorBox}>{error}</div>
            )}

            {appointments.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: '40px', margin: '0 0 16px' }}>
                        📅
                    </p>
                    <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        margin: '0 0 20px'
                    }}>
                        No appointments yet
                    </p>
                    <Link
                        to="/book-appointment"
                        style={styles.bookButton}
                    >
                        Book Your First Appointment
                    </Link>
                </div>
            ) : (
                <div style={styles.list}>
                    {appointments.map(appt => {
                        const statusStyle =
                            STATUS_COLORS[appt.appointment_status] ||
                            STATUS_COLORS.Booked
                        const paymentStyle =
                            PAYMENT_COLORS[appt.payment_status] ||
                            PAYMENT_COLORS.Unpaid

                        const canCancel =
                            appt.appointment_status === 'Booked' ||
                            appt.appointment_status === 'Confirmed'

                        return (
                            <div key={appt.name} style={styles.card}>
                                <div style={styles.cardTop}>
                                    <div>
                                        <p style={styles.doctorName}>
                                            {appt.doctor_name}
                                        </p>
                                        <p style={styles.apptId}>
                                            {appt.name}
                                        </p>
                                    </div>
                                    <div style={styles.badges}>
                                        <span style={{
                                            ...styles.badge,
                                            background: statusStyle.bg,
                                            color: statusStyle.color
                                        }}>
                                            {appt.appointment_status}
                                        </span>
                                        <span style={{
                                            ...styles.badge,
                                            background: paymentStyle.bg,
                                            color: paymentStyle.color
                                        }}>
                                            {appt.payment_status}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.cardDetails}>
                                    <div style={styles.detail}>
                                        <span style={styles.detailLabel}>
                                            Date
                                        </span>
                                        <span style={styles.detailValue}>
                                            {appt.appointment_date}
                                        </span>
                                    </div>
                                    <div style={styles.detail}>
                                        <span style={styles.detailLabel}>
                                            Time
                                        </span>
                                        <span style={styles.detailValue}>
                                            {String(appt.from_time)
                                                .substring(0, 5)}
                                        </span>
                                    </div>
                                    <div style={styles.detail}>
                                        <span style={styles.detailLabel}>
                                            Type
                                        </span>
                                        <span style={styles.detailValue}>
                                            {appt.appointment_type}
                                        </span>
                                    </div>
                                    <div style={styles.detail}>
                                        <span style={styles.detailLabel}>
                                            Fee
                                        </span>
                                        <span style={{
                                            ...styles.detailValue,
                                            color: '#2563eb',
                                            fontWeight: '600'
                                        }}>
                                            ₹{appt.consultation_fee}
                                        </span>
                                    </div>
                                </div>

                                {canCancel && (
                                    <div style={styles.cardFooter}>
                                        <button
                                            onClick={() =>
                                                handleCancel(appt.name)
                                            }
                                            disabled={
                                                cancelling === appt.name
                                            }
                                            style={styles.cancelButton}
                                        >
                                            {cancelling === appt.name
                                                ? 'Cancelling...'
                                                : 'Cancel Appointment'
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const styles = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        color: '#64748b'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
    },
    title: {
        margin: '0 0 4px',
        fontSize: '22px',
        fontWeight: '600',
        color: '#1e293b'
    },
    subtitle: {
        margin: 0,
        color: '#64748b',
        fontSize: '14px'
    },
    bookButton: {
        padding: '10px 18px',
        background: '#2563eb',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500'
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
    emptyState: {
        textAlign: 'center',
        padding: '60px 24px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px 20px 12px'
    },
    doctorName: {
        margin: '0 0 4px',
        fontWeight: '600',
        color: '#1e293b',
        fontSize: '16px'
    },
    apptId: {
        margin: 0,
        color: '#94a3b8',
        fontSize: '12px'
    },
    badges: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500'
    },
    cardDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '12px 20px',
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9'
    },
    detail: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    detailLabel: {
        fontSize: '11px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    detailValue: {
        fontSize: '14px',
        color: '#1e293b',
        fontWeight: '500'
    },
    cardFooter: {
        padding: '12px 20px',
        borderTop: '1px solid #f1f5f9'
    },
    cancelButton: {
        padding: '8px 16px',
        background: 'white',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    }
}