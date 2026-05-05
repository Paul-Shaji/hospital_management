import { Link, useNavigate } from 'react-router-dom'
import { logout } from "../api/api"

export default function Navbar({ user, setUser }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        setUser(null)
        navigate('/login')
    }

    return (
        <nav style={{
            background: '#2563eb',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '18px',
                textDecoration: 'none'
            }}>
                Hospital Portal
            </Link>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <Link to="/book-appointment" style={{
                            color: 'white', textDecoration: 'none'
                        }}>
                            Book Appointment
                        </Link>
                        <Link to="/my-appointments" style={{
                            color: 'white', textDecoration: 'none'
                        }}>
                            My Appointments
                        </Link>
                        <button onClick={handleLogout} style={{
                            background: 'white',
                            color: '#2563eb',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{
                            color: 'white', textDecoration: 'none'
                        }}>
                            Login
                        </Link>
                        <Link to="/register" style={{
                            color: 'white',
                            background: 'white',
                            color: '#2563eb',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}