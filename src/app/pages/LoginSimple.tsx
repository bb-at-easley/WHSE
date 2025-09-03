"use client";

import { useState, useTransition } from "react";
import { loginWithPassword } from "./user/password-auth";

export function LoginSimple() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const response = await loginWithPassword(
        formData.email,
        formData.password
      );

      if (response.success) {
        setResult("Welcome back! Taking you to the warehouse...");
        setTimeout(() => {
          window.location.href = "/org/easley/warehouse/dashboard";
        }, 2000);
      } else {
        setResult(response.error || "Failed to log in");
      }
    });
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 8px 0'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0'
          }}>
            Sign in to Easley Transportation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Your email address"
              required
              style={{
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                background: '#f8f9fa',
                color: '#333',
                boxSizing: 'border-box',
                width: '100%'
              }}
            />

            <input
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Your password"
              required
              style={{
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                background: '#f8f9fa',
                color: '#333',
                boxSizing: 'border-box',
                width: '100%'
              }}
            />

            <button 
              type="submit"
              disabled={isPending}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? '0.7' : '1',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>

            {result && (
              <div style={{
                padding: '16px',
                background: result.includes('Welcome') ? '#e8f5e8' : '#fee2e2',
                color: result.includes('Welcome') ? '#4CAF50' : '#dc2626',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                {result}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <span style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '12px',
            display: 'block'
          }}>
            Forgot password? Contact your supervisor
          </span>
          <a 
            href="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}