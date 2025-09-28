import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL for server functions
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1f1a48b6`;

// Helper function to make authenticated API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Initialize backend storage
export async function initializeBackend() {
  try {
    await fetch(`${API_BASE_URL}/init`);
  } catch (error) {
    console.error('Failed to initialize backend:', error);
  }
}