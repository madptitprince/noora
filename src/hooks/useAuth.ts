import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../lib/database.types';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          console.log('No profile found for user, will be created on first signup');
          setProfile(null);
        } else {
          console.error('Error loading profile:', error);
          // Only show error toast once per session
          if (!sessionStorage.getItem('profile_error_shown')) {
            toast.error('Erreur lors du chargement du profil');
            sessionStorage.setItem('profile_error_shown', 'true');
          }
        }
      } else {
        setProfile(data);
        // Clear any previous error flags
        sessionStorage.removeItem('profile_error_shown');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Only show error toast once per session
      if (!sessionStorage.getItem('profile_error_shown')) {
        toast.error('Erreur lors du chargement du profil');
        sessionStorage.setItem('profile_error_shown', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(`Erreur de connexion: ${error.message}`);
      } else {
        toast.success('Connexion réussie!');
      }
      
      return { data, error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Erreur lors de la connexion');
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, role: 'owner' | 'manager' = 'manager') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(`Erreur d'inscription: ${error.message}`);
        return { data, error };
      }

      if (data.user) {
        try {
          // Create user profile
          const { error: profileError } = await supabase.from('user_profiles').insert({
            id: data.user.id,
            email,
            role,
          });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast.error('Erreur lors de la création du profil utilisateur');
          } else {
            toast.success('Compte créé avec succès!');
          }
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Erreur lors de la création du profil utilisateur');
        }
      }

      return { data, error };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erreur lors de l\'inscription');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isOwner: profile?.role === 'owner',
    isManager: profile?.role === 'manager',
  };
}