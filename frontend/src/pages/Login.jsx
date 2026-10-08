import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            SaaS <span className="text-indigo-600">Kit</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <p className="mt-3 rounded-lg bg-indigo-50 px-4 py-2 text-xs text-indigo-700">
              Interactive preview — sign in with the demo credentials below. Data is simulated.
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Demo credentials</p>
            <p className="mt-1">
              Email: <span className="font-mono">admin@demo.io</span>
            </p>
            <p>
              Password: <span className="font-mono">password</span>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
