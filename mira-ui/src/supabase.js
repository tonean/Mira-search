// Supabase configuration and utilities
// TODO: Install Supabase client: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase credentials
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Debug: Log environment variables
console.log('Environment variables check:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('Using SUPABASE_URL:', SUPABASE_URL);

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// User management functions
export const supabaseAuth = {
  // Sign in with Google
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database functions for user data
export const supabaseDB = {
  // Save user profile
  async saveUserProfile(userData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        given_name: userData.given_name,
        family_name: userData.family_name,
        picture: userData.picture,
        provider: userData.provider,
        updated_at: new Date()
      })
    return { data, error }
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Save chat history
  async saveChatHistory(userId, chatHistory) {
    const { data, error } = await supabase
      .from('chat_history')
      .upsert({
        user_id: userId,
        history: chatHistory,
        updated_at: new Date()
      })
    return { data, error }
  },

  // Get chat history
  async getChatHistory(userId) {
    const { data, error } = await supabase
      .from('chat_history')
      .select('history')
      .eq('user_id', userId)
      .single()
    return { data: data?.history || [], error }
  },

  // Save connections
  async saveConnections(userId, connections) {
    const { data, error } = await supabase
      .from('connections')
      .upsert({
        user_id: userId,
        services: connections,
        updated_at: new Date()
      })
    return { data, error }
  },

  // Get connections
  async getConnections(userId) {
    const { data, error } = await supabase
      .from('connections')
      .select('services')
      .eq('user_id', userId)
      .single()
    return { data: data?.services || [], error }
  }
} 