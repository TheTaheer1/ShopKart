import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import PasswordInput from '../components/PasswordInput'

function Login() {

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()


    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }


    const handleSubmit = async (e) => {

        // Prevent page from refreshing
        e.preventDefault()

        // Remove previous error
        setError('')

        if (!form.email.trim() || !form.password) {
            setError('Please enter your email and password.')
            return
        }

        // Start loading
        setIsSubmitting(true)

        try {

            // Send login data to backend
            await api.post('/customers/login', form)

            // Login successful → go to home page
            navigate('/home')

        } catch (error) {
            // Get error message sent by backend
            setError(
                error.response?.status === 401
                    ? 'Invalid Credentials'
                    : error.response?.data?.message ||
                      'Unable to log in. Please try again.'
            )

        } finally {

            // Stop loading
            setIsSubmitting(false)
        }
    }


    return (
        <main className="auth-shell">

            <section className="auth-intro">
                <p className="eyebrow">
                    THE EVERYDAY MARKETPLACE
                </p>

                <h1>
                    Everything you need, one good find away.
                </h1>

                <p className="intro-copy">
                    Shop with intention. Discover useful things,
                    familiar favorites, and a little inspiration
                    for the week ahead.
                </p>

                <div className="intro-stamp">
                    EST. 2026 <span>•</span> SHOPKART
                </div>
            </section>


            <section className="auth-panel">

                <div className="panel-heading">
                    <p className="eyebrow">
                        WELCOME BACK
                    </p>

                    <h2>
                        Sign in to ShopKart
                    </h2>

                    {location.state?.registered && (
                        <p className="success-message">
                            Account created. You can sign in now.
                        </p>
                    )}
                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <label htmlFor="email">
                        Email address
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />


                    <label htmlFor="password">
                        Password
                    </label>

                    <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        visible={isPasswordVisible}
                        onToggle={() => setIsPasswordVisible((visible) => !visible)}
                    />


                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}


                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Signing in...'
                            : 'Sign in'
                        }

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                </form>


                <p className="switch-auth">
                    New to ShopKart?{' '}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>

            </section>
        </main>
    )
}

export default Login

