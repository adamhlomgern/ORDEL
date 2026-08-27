import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export type AuthStatus =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'needsProfile'; session: Session }
  | { kind: 'ready'; session: Session; username: string };

interface AuthContextValue {
  status: AuthStatus;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfileUsername(userId: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return data.username as string;
}

async function resolveStatus(session: Session | null): Promise<AuthStatus> {
  if (!session) {
    return { kind: 'signedOut' };
  }
  const username = await loadProfileUsername(session.user.id);
  return username ? { kind: 'ready', session, username } : { kind: 'needsProfile', session };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        resolveStatus(data.session).then((next) => {
          if (!cancelled) setStatus(next);
        });
      });

    const { data: subscription } = getSupabase().auth.onAuthStateChange((_event, session) => {
      resolveStatus(session).then((next) => {
        if (!cancelled) setStatus(next);
      });
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    const { data } = await getSupabase().auth.getSession();
    setStatus(await resolveStatus(data.session));
  };

  return <AuthContext.Provider value={{ status, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
