"use server";

import { db } from "@/db";
import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";

// Simple password hashing - in production you'd use bcrypt or similar
async function hashPassword(password: string): Promise<string> {
  // Using Web Crypto API for simplicity - replace with bcrypt in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

export async function signupWithPassword(
  fullName: string, 
  email: string, 
  password: string,
  organizationId: string
): Promise<{ success: boolean; error?: string; redirect?: string }> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create user - much simpler!
    const user = await db.user.create({
      data: {
        fullName,
        email,
        passwordHash
      }
    });

    // Create membership in the organization
    await db.membership.create({
      data: {
        userId: user.id,
        organizationId,
        role: 'MEMBER'
      }
    });

    // Create session using proper headers that get sent back to browser
    const { headers } = requestInfo;
    await sessions.save(headers, {
      userId: user.id,
      challenge: null
    });

    return { success: true, redirect: "/warehouse/dashboard" };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function loginWithPassword(
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session using proper headers that get sent back to browser
    const { headers } = requestInfo;
    await sessions.save(headers, {
      userId: user.id,
      challenge: null
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: "Failed to log in" };
  }
}