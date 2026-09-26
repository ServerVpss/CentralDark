import React, { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: FC = () => {
  const navigate = useNavigate();
  const onLogin = () => navigate('/app');
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test@123');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd validate here. For now, we just call onLogin.
    onLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="material-symbols-outlined">chat_bubble</span>
          <h2>NexChat</h2>
        </div>

        <div className="auth-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Join our community of 2k+ users today.' : 'Please enter your details to sign in.'}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-dark-surface-light p-1 rounded-xl mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-primary text-background-dark' : 'text-dark-text-muted hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-primary text-background-dark' : 'text-dark-text-muted hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="social-auth">
          <button onClick={onLogin} className="social-btn">
            <span>Google</span>
          </button>
          <button onClick={onLogin} className="social-btn">
            <span>Apple</span>
          </button>
        </div>

        <div className="auth-divider">Or continue with</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end mb-2">
              <a href="#" className="text-sm font-bold text-primary hover:underline">Forgot Password?</a>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full py-4 mt-2">
            <span>{isSignUp ? 'Get Started' : 'Sign In'}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
              {isSignUp ? 'Log in here' : 'Create one now'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
