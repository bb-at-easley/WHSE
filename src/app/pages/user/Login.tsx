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

export function Login({ organization }: { organization: { name: string; slug: string } }) {
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
      setResult("Login successful! Redirecting...");
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = `/org/${organization.slug}/warehouse/dashboard`;
      }, 1500);
    }
  };

  const passkeyRegister = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyRegistration(username, organization.id);

    // 2. Ask the browser to sign the challenge
    const registration = await startRegistration({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the registration process
    const success = await finishPasskeyRegistration(username, registration, organization.id);

    if (!success) {
      setResult("Registration failed");
    } else {
      setResult("Registration successful! Redirecting...");
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        window.location.href = `/org/${organization.slug}/warehouse/dashboard`;
      }, 1500);
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
            {organization.name}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0'
          }}>
            Warehouse Access
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
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
            onClick={handlePerformPasskeyLogin} 
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
            {isPending ? 'Authenticating...' : 'Login with Passkey'}
          </button>

          <button 
            onClick={handlePerformPasskeyRegister} 
            disabled={isPending || !username.trim()}
            style={{
              background: '#f8f9fa',
              color: '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (isPending || !username.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isPending || !username.trim()) ? '0.7' : '1',
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            {isPending ? 'Registering...' : 'Register New User'}
          </button>

          {result && (
            <div style={{
              padding: '16px',
              background: result.includes('successful') ? '#e8f5e8' : '#fee2e2',
              color: result.includes('successful') ? '#4CAF50' : '#dc2626',
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

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <a 
            href="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
