import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SignUpForm from '../components/SignUpForm'


const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch ('http://localhost:5000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }


        // Redirect to login page after successful signup
        navigate('/login', { state: { message: 'Signup successful! Please log in.' } 
        });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div>
        <SignUpForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSignUp}
            error={error}
            loading={loading}
        />
        <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Signup