import { supabase } from './supabaseClient';

// Helper to create CRUD operations for any table
const createEntity = (tableName) => ({
    async list(orderBy = 'created_at') {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order(orderBy, { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async filter(filters = {}, orderBy = 'created_at') {
        let query = supabase.from(tableName).select('*');
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        const { data, error } = await query.order(orderBy);
        if (error) throw error;
        return data || [];
    },

    async get(id) {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(record) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from(tableName)
            .insert({ ...record, user_id: user?.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from(tableName)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
});

// Export all entities
export const Project = createEntity('projects');
export const Font = createEntity('fonts');
export const CreditPackage = createEntity('credit_packages');
export const SubscriptionPlan = createEntity('subscription_plans');
export const Business = createEntity('businesses');
export const CopyPersona = createEntity('copy_personas');
export const Conversation = createEntity('conversations');
export const Message = createEntity('messages');
export const LikedAd = createEntity('liked_ads');

// User (Auth) - Special handling
export const User = {
    async me() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        // Try to get extended profile
        try {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            return { ...user, ...profile };
        } catch {
            // Profile doesn't exist yet, return basic user info
            return {
                ...user,
                credits: 5, // Default credits for new users
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
            };
        }
    },

    // Login with Google (via Supabase's built-in OAuth)
    async loginWithRedirect(redirectUrl) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl || window.location.origin
            }
        });
        if (error) throw error;
    },

    // Login with Facebook (via Supabase's built-in OAuth)
    async loginWithFacebook(redirectUrl) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: redirectUrl || window.location.origin
            }
        });
        if (error) throw error;
    },

    // Login with Apple (via Supabase's built-in OAuth)
    async loginWithApple(redirectUrl) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: redirectUrl || window.location.origin
            }
        });
        if (error) throw error;
    },

    // Login with Magic Link (email OTP)
    async loginWithEmail(email, redirectUrl) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectUrl || window.location.origin
            }
        });
        if (error) throw error;
        return { success: true, message: 'קוד אימות נשלח למייל שלך!' };
    },

    // Verify OTP code
    async verifyOtp(email, token) {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        if (error) throw error;
        return data;
    },

    async logout() {
        await supabase.auth.signOut();
        window.location.href = '/';
    },

    // For listening to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Get current session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }
};