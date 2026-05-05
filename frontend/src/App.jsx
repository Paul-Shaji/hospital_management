import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getLoggedInUser } from './api/api'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import ProtectedRoute from './components/ProtectedRoutes'

export default function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getLoggedInUser()
            .then(res => {
                const u = res.data.message
                setUser(u === 'Guest' ? null : u)
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px'
        }}>
            Loading...
        </div>
    )

    return (
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }}>
            <Navbar user={user} setUser={setUser} />
            <Routes>
                <Route path="/" element={
                    user
                        ? <Navigate to="/my-appointments" />
                        : <Navigate to="/login" />
                } />
                <Route path="/login" element={
                    <Login setUser={setUser} />
                } />
                <Route path="/register" element={
                    <Register setUser={setUser} />
                } />
                <Route path="/book-appointment" element={
                    <ProtectedRoute user={user}>
                        <BookAppointment user={user} />
                    </ProtectedRoute>
                } />
                <Route path="/my-appointments" element={
                    <ProtectedRoute user={user}>
                        <MyAppointments />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}