import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isAlert?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = true,
    isAlert = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden p-6"
                    >
                        {/* Decorative background glow */}
                        <div className={`absolute -top-24 -right-24 size-48 rounded-full blur-3xl opacity-20 pointer-events-none ${isDestructive ? 'bg-red-500' : (isAlert && !isDestructive ? 'bg-green-500' : 'bg-primary')}`} />
                        
                        <div className="relative z-10">
                            <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : (isAlert && !isDestructive ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary')}`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {isDestructive ? 'warning' : (isAlert && !isDestructive ? 'check_circle' : 'info')}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                {!isAlert && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm hover:shadow"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 ${
                                        isDestructive 
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25 hover:shadow-red-500/40' 
                                        : (isAlert && !isDestructive
                                            ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/25 hover:shadow-slate-900/40'
                                            : 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40')
                                    }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
