import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import getApiBase from '../apiBase';

const inputVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 120 },
  }),
};

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = getApiBase();

  const validate = () => {
    const errs = {};
    if (!form.fullName) errs.fullName = 'Full Name is required';
    if (!form.phone) errs.phone = 'Phone Number is required';
    if (!form.password) errs.password = 'Password is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setLoading(false);
      if ((res.ok && data.user) || (res.status === 201 && data.message && data.message.toLowerCase().includes('user registered successfully'))) {
        toast.success('Registered successfully!');
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        // Store phone in localStorage for login prefill
        localStorage.setItem('prefillPhone', form.phone);
        setTimeout(() => navigate('/login'), 1200);
      } else {
        if (data.message && data.message.toLowerCase().includes('phone number already registered')) {
          toast.error('Phone number already exists!');
        } else {
          toast.error(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#181E2A] to-[#232946]"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="w-full max-w-md mx-auto rounded-2xl p-8 md:p-10 bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 flex flex-col items-center"
        role="form"
        aria-label="Registration form"
      >
        {/* Logo Placeholder */}
        <div className="flex flex-col items-center mb-4">
          <svg className="h-12 w-12 text-[#10B981] mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" fill="#0F172A" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01" stroke="#10B981" strokeWidth="2" />
          </svg>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-[Poppins] tracking-tight">Chatrr</h1>
          <p className="text-md text-[#A5B4FC] mt-1 text-center font-[Inter]">Create your account and start chatting instantly.</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-5 mt-2" autoComplete="off">
          {[
            { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
            { name: 'phone', label: 'Phone Number', type: 'text', autoComplete: 'tel' },
            { name: 'password', label: 'Password', type: showPassword ? 'text' : 'password', autoComplete: 'new-password' },
          ].map((field, i) => (
            <motion.div
              key={field.name}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={inputVariants}
            >
              <label htmlFor={field.name} className="block text-[#A5B4FC] font-semibold mb-1 font-[Inter]">
                {field.label}
              </label>
              <div className={`relative rounded-2xl bg-white/20 focus-within:ring-2 focus-within:ring-[#10B981] transition-all duration-200 ${errors[field.name] ? 'ring-2 ring-pink-400' : ''}`}
                style={{ boxShadow: '0 4px 24px 0 rgba(16,23,42,0.10)' }}>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  aria-label={field.label}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                  className="w-full px-4 py-3 bg-transparent outline-none text-white text-lg rounded-2xl placeholder-[#A5B4FC] font-[Inter] focus:ring-0"
                  placeholder={field.label}
                  value={form[field.name]}
                  onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                />
                {/* Password show/hide toggle */}
                {field.name === 'password' && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5B4FC] hover:text-[#10B981]"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                )}
              </div>
              {errors[field.name] && <span id={`${field.name}-error`} className="text-pink-400 text-sm font-medium">{errors[field.name]}</span>}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
          >
            <button
              type="submit"
              className={`w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#10B981] to-[#0F172A] text-white text-lg font-bold shadow-lg transition-transform duration-150 active:scale-95 hover:scale-105 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : 'Create Account'}
            </button>
          </motion.div>
        </form>
        <div className="mt-6 text-center">
          <span className="text-[#A5B4FC] font-[Inter]">Already have an account? </span>
          <Link to="/login" className="text-[#10B981] font-bold hover:underline">Log in</Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register; 