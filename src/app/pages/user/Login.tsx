"use client";

import { useState, useTransition } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "./functions";

export function Login() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const passkeyLogin = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyLogin();

    // 2. Ask the browser to sign the challenge
    const login = await startAuthentication({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the login process
    const success = await finishPasskeyLogin(login);

    if (!success) {
      setResult("Login failed");
    } else {
      setResult("Login successful!");
    }
  };

  const passkeyRegister = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyRegistration(username);

    // 2. Ask the browser to sign the challenge
    const registration = await startRegistration({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the registration process
    const success = await finishPasskeyRegistration(username, registration);

    if (!success) {
      setResult("Registration failed");
    } else {
      setResult("Registration successful!");
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#2c2826',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#f7f6f4',
        padding: '0',
        borderRadius: '8px',
        border: '4px solid #1c1917',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#1c1917',
          color: '#fefefe',
          padding: '32px',
          textAlign: 'center',
          borderBottom: '4px solid #b45309'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            WAREHOUSE ACCESS
          </h1>
          <p style={{
            color: '#b45309',
            margin: '0',
            fontSize: '16px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            SECURE LOGIN
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '3px solid #e8e6e2',
              borderRadius: '8px',
              background: '#fefefe',
              color: '#1c1917',
              marginBottom: '24px',
              fontFamily: 'Inter, -apple-system, sans-serif',
              boxSizing: 'border-box'
            }}
          />

          <button 
            onClick={handlePerformPasskeyLogin} 
            disabled={isPending}
            style={{
              width: '100%',
              background: '#b45309',
              color: 'white',
              border: '3px solid #92400e',
              borderRadius: '8px',
              padding: '18px',
              fontSize: '16px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              opacity: isPending ? '0.7' : '1',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {isPending ? 'AUTHENTICATING...' : '🔐 LOGIN WITH PASSKEY'}
          </button>

          <button 
            onClick={handlePerformPasskeyRegister} 
            disabled={isPending}
            style={{
              width: '100%',
              background: '#6b7280',
              color: 'white',
              border: '2px solid #4b5563',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              opacity: isPending ? '0.7' : '1',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {isPending ? 'REGISTERING...' : '➕ REGISTER NEW USER'}
          </button>

          {result && (
            <div style={{
              padding: '16px',
              background: result.includes('successful') ? '#d1fae5' : '#fee2e2',
              color: result.includes('successful') ? '#047857' : '#dc2626',
              border: `2px solid ${result.includes('successful') ? '#047857' : '#dc2626'}`,
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '14px'
            }}>
              {result}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9f8f6',
          padding: '20px',
          textAlign: 'center',
          borderTop: '2px solid #e8e6e2'
        }}>
          <a 
            href="/"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}
          >
            ← BACK TO HOME
          </a>
        </div>
      </div>
    </div>
  );
}
