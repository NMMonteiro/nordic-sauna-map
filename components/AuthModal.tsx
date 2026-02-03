import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'login' | 'register';
    lang: 'sv' | 'fi' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, initialMode = 'login', lang }) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translations = {
        login: { sv: 'Logga in', fi: 'Kirjaudu sisään', en: 'Sign In' },
        register: { sv: 'Skapa konto', fi: 'Luo tili', en: 'Create Account' },
        email: { sv: 'E-post', fi: 'Sähköposti', en: 'Email address' },
        password: { sv: 'Lösenord', fi: 'Salasana', en: 'Password' },
        fullName: { sv: 'Namn', fi: 'Nimi', en: 'Full Name' },
        noAccount: { sv: 'Inget konto?', fi: 'Ei vielä tiliä?', en: "Don't have an account?" },
        hasAccount: { sv: 'Har du redan ett konto?', fi: 'Onko sinulla jo tili?', en: 'Already have an account?' },
        submit: { sv: 'Fortsätt', fi: 'Jatka', en: 'Continue' },
        authSuccess: { sv: 'Kolla din e-post för verifiering!', fi: 'Tarkista sähköpostistasi vahvistus!', en: 'Check your email for verification!' }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'register') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (signUpError) throw signUpError;
                alert(translations.authSuccess[lang]);
                onClose();
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="size-20 bg-nordic-lake rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-primary/30">
                            <span className="material-symbols-outlined text-4xl">lock_open</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {translations[mode][lang]}
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">
                            Nordic Sauna Heritage Map
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                    {translations.fullName[lang]}
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                {translations.email[lang]}
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                                {translations.password[lang]}
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 mt-6 uppercase tracking-widest text-xs"
                        >
                            {loading ? '...' : translations.submit[lang]}
                        </button>
                    </form>

                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="w-full text-center mt-8 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                    >
                        {mode === 'login' ? translations.noAccount[lang] : translations.hasAccount[lang]}
                    </button>
                </div>
            </div>
        </div>
    );
};
