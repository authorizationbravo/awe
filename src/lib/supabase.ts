import { createClient } from '@supabase/supabase-js';

// Mock Supabase configuration for demo purposes
// In production, these would come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Mock authentication for demo purposes
class MockAuth {
  private user: any = null;
  private listeners: any[] = [];

  async getUser() {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      return { data: { user: this.user }, error: null };
    }
    return { data: { user: null }, error: null };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Mock sign in - accept any credentials for demo
    const user = {
      id: crypto.randomUUID(),
      email,
      user_metadata: { full_name: email.split('@')[0] },
      created_at: new Date().toISOString()
    };
    
    this.user = user;
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    // Notify listeners
    this.listeners.forEach(callback => callback('SIGNED_IN', { user }));
    
    return { data: { user, session: { user } }, error: null };
  }

  async signUp({ email, password, options }: any) {
    // Mock sign up
    const user = {
      id: crypto.randomUUID(),
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString()
    };
    
    this.user = user;
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    // Notify listeners
    this.listeners.forEach(callback => callback('SIGNED_IN', { user }));
    
    return { data: { user, session: { user } }, error: null };
  }

  async signOut() {
    this.user = null;
    localStorage.removeItem('mockUser');
    
    // Notify listeners
    this.listeners.forEach(callback => callback('SIGNED_OUT', null));
    
    return { error: null };
  }

  async resetPasswordForEmail(email: string) {
    // Mock password reset
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    
    // Initial call
    setTimeout(() => {
      if (this.user) {
        callback('SIGNED_IN', { user: this.user });
      }
    }, 100);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
}

// Replace auth with mock for demo
if (!supabaseUrl.includes('supabase.co')) {
  (supabase as any).auth = new MockAuth();
}