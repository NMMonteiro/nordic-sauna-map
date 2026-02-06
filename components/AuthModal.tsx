import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../types';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
    lang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, lang }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translations = {
        login: { sv: 'Logga in', fi: 'Kirjaudu', en: 'Sign In' },
        register: { sv: 'Skapa konto', fi: 'Luo tili', en: 'Join Archive' },
        email: { sv: 'E-post', fi: 'Sähköposti', en: 'Email Address' },
        password: { sv: 'Lösenord', fi: 'Salasana', en: 'Password' },
        fullName: { sv: 'Namn', fi: 'Nimi', en: 'Full Name' },
        submit: { sv: 'Fortsätt', fi: 'Jatka', en: 'Continue' },
        noAccount: { sv: 'Inget konto? Skapa ett', fi: 'Eikö tiliä? Luo se', en: 'New here? Join the archive' },
        hasAccount: { sv: 'Har du redan ett konto? Logga in', fi: 'Onko sinulla jo tili? Kirjaudu', en: 'Already a member? Sign in' }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'register') {
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });

                if (signUpError) throw signUpError;

                if (authData.user) {
                    await supabase.from('profiles').insert([
                        { id: authData.user.id, full_name: fullName, role: 'member', status: 'pending' }
                    ]);
                    alert(lang === 'fi' ? 'Vahvistusviesti lähetetty!' : 'Confirmation email sent!');
                    onSuccess();
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (googleError) throw googleError;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 size-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:scale-110 rounded-full transition-all z-10"
                >
                    <X className="size-5" />
                </button>

                <div className="p-12 md:p-16">
                    <div className="text-center mb-12 relative">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6"
                        >
                            <ShieldCheck className="size-8" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            {translations[mode][lang]}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">Nordic Sauna Heritage Registry</p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-slate-200 py-4 rounded-[1.5rem] font-bold text-slate-700 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" className="size-5" />
                            <span className="text-xs uppercase tracking-widest font-black">Continue with Google</span>
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                <span className="bg-white px-4 text-slate-300">or use email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                                {translations.fullName[lang]}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                                                    <UserIcon className="size-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-4 outline-none transition-all font-semibold text-slate-900"
                                                    placeholder="John Doe"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                    {translations.email[lang]}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Mail className="size-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-4 outline-none transition-all font-semibold text-slate-900"
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                    {translations.password[lang]}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock className="size-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-50 focus:border-primary/20 focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-4 outline-none transition-all font-semibold text-slate-900"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-50 text-red-600 text-[11px] font-bold p-5 rounded-2xl border border-red-100"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-900/30 overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? 'Processing...' : translations.submit[lang]}
                                    {!loading && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                            </button>
                        </form>
                    </div>

                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="w-full text-center mt-10 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                    >
                        {mode === 'login' ? translations.noAccount[lang] : translations.hasAccount[lang]}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
