import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BrandingPreferences } from '../../types';
import {
    Palette,
    Type,
    Image as ImageIcon,
    Layout as LayoutIcon,
    Save,
    RotateCcw,
    Smartphone,
    Tablet,
    Monitor,
    Check,
    ChevronRight,
    Sparkles,
    Globe,
    Upload,
    Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';

type PanelType = 'branding' | 'theme' | 'typography' | 'footer' | 'landing' | 'funding';

export const DesignStudio: React.FC = () => {
    const [preferences, setPreferences] = useState<BrandingPreferences>({
        primaryColor: '#2563EB',
        secondaryColor: '#0F172A',
        fontFamily: 'Outfit',
        siteName: 'Educational Portal',
        heroTitle: 'LEARNING\nREIMAGINED.',
        heroSubtitle: 'Access exclusive pedagogical materials, research, and resources designed to transform your learning environment.',
        theme: 'light'
    });

    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState<PanelType>('theme');
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
    const [uploadingFundingLogo, setUploadingFundingLogo] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const brandingRef = doc(db, 'configs', 'branding');
            const brandingSnap = await getDoc(brandingRef);

            if (brandingSnap.exists()) {
                setPreferences(brandingSnap.data() as BrandingPreferences);
            }
        } catch (err) {
            console.error('Fetch branding error:', err);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const brandingRef = doc(db, 'configs', 'branding');
            // We use setDoc instead of updateDoc to ensure it works even if doc doesn't exist
            await setDoc(brandingRef, preferences, { merge: true });

            // Broadcast a custom event or just reload to apply changes
            window.location.reload();
        } catch (err: any) {
            alert('Failed to save settings: ' + err.message);
        }
        setIsSaving(false);
    };

    const handleUpdate = (updates: Partial<BrandingPreferences>) => {
        setPreferences(prev => ({ ...prev, ...updates }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const storageRef = ref(storage, `branding/logo_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            handleUpdate({ logoUrl: downloadURL });
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleHeroBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingHeroBg(true);
        try {
            const storageRef = ref(storage, `branding/hero_bg_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Auto-detect if it's a video based on file type
            const isVideo = file.type.startsWith('video/');
            handleUpdate({
                heroBgUrl: downloadURL,
                heroBgType: isVideo ? 'video' : 'image'
            });
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploadingHeroBg(false);
        }
    };

    const handleFundingLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFundingLogo(true);
        try {
            const storageRef = ref(storage, `branding/funding_logo_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            handleUpdate({ fundingLogoUrl: downloadURL });
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploadingFundingLogo(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-semibold uppercase tracking-wide text-slate-300 animate-pulse">Initializing Studio...</div>;

    return (
        <div className="flex h-[calc(100vh-140px)] bg-slate-50 overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl">
            {/* 1. Control Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10">
                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Design Studio</h2>
                    <p className="text-xl font-semibold text-slate-900 tracking-tight uppercase">Site Branding</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <NavButton
                        icon={<Globe size={18} />}
                        label="Site Identity"
                        active={activePanel === 'branding'}
                        onClick={() => setActivePanel('branding')}
                    />
                    <NavButton
                        icon={<Sparkles size={18} />}
                        label="Landing Page"
                        active={activePanel === 'landing'}
                        onClick={() => setActivePanel('landing')}
                    />
                    <NavButton
                        icon={<Palette size={18} />}
                        label="Color Palette"
                        active={activePanel === 'theme'}
                        onClick={() => setActivePanel('theme')}
                    />
                    <NavButton
                        icon={<Type size={18} />}
                        label="Typography"
                        active={activePanel === 'typography'}
                        onClick={() => setActivePanel('typography')}
                    />
                    <NavButton
                        icon={<Building2 size={18} />}
                        label="Funding"
                        active={activePanel === 'funding'}
                        onClick={() => setActivePanel('funding')}
                    />
                </nav>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button
                        onClick={fetchPreferences}
                        className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold uppercase hover:bg-slate-50 transition-all"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                        {isSaving ? <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />}
                        {isSaving ? 'Direct Publish' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* 2. Live Attributes Panel */}
            <div className="w-96 bg-slate-50 border-r border-slate-200 overflow-y-auto p-10 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activePanel === 'branding' && (
                        <motion.div
                            key="branding"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Portal Name</h3>
                                <input
                                    type="text"
                                    value={preferences.siteName}
                                    onChange={(e) => handleUpdate({ siteName: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Portal Tagline</h3>
                                <input
                                    type="text"
                                    value={preferences.siteTagline || ''}
                                    onChange={(e) => handleUpdate({ siteTagline: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-600 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Logo URL</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Logo URL (e.g. https://...)"
                                            value={preferences.logoUrl || ''}
                                            onChange={(e) => handleUpdate({ logoUrl: e.target.value })}
                                            className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                        />
                                        <div className="size-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                            {preferences.logoUrl ? <img src={preferences.logoUrl} className="max-w-full max-h-full p-2" /> : <ImageIcon className="text-slate-200" />}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={uploadingImage}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className={cn(
                                                "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium text-xs cursor-pointer hover:border-primary hover:text-primary transition-all",
                                                uploadingImage && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {uploadingImage ? (
                                                <>
                                                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                    UPLOADING...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} />
                                                    UPLOAD LOCAL LOGO
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    {/* Logo Size Slider */}
                                    <div className="pt-2">
                                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                            <span>SIZE</span>
                                            <span>{preferences.logoSize || 40}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="20"
                                            max="120"
                                            value={preferences.logoSize || 40}
                                            onChange={(e) => handleUpdate({ logoSize: Number(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Hero Headline</h3>
                                <textarea
                                    rows={4}
                                    value={preferences.heroTitle}
                                    onChange={(e) => handleUpdate({ heroTitle: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-semibold uppercase text-sm tracking-tight text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none resize-none"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Hero Subheadline</h3>
                                <textarea
                                    rows={5}
                                    value={preferences.heroSubtitle}
                                    onChange={(e) => handleUpdate({ heroSubtitle: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium leading-relaxed text-slate-500 focus:ring-2 focus:ring-primary shadow-sm outline-none resize-none"
                                />
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Hero Background</h3>

                                {/* Background Type Toggle */}
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={() => handleUpdate({ heroBgType: 'image' })}
                                        className={cn(
                                            "flex-1 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all",
                                            preferences.heroBgType === 'image' || !preferences.heroBgType
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        )}
                                    >
                                        Image
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({ heroBgType: 'video' })}
                                        className={cn(
                                            "flex-1 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all",
                                            preferences.heroBgType === 'video'
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        )}
                                    >
                                        Video
                                    </button>
                                </div>

                                {/* URL Input */}
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder={`${preferences.heroBgType === 'video' ? 'Video' : 'Image'} URL (e.g. https://...)`}
                                        value={preferences.heroBgUrl || ''}
                                        onChange={(e) => handleUpdate({ heroBgUrl: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                    />

                                    {/* File Upload */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="hero-bg-upload"
                                            className="hidden"
                                            accept={preferences.heroBgType === 'video' ? 'video/*' : 'image/*'}
                                            onChange={handleHeroBgFileChange}
                                            disabled={uploadingHeroBg}
                                        />
                                        <label
                                            htmlFor="hero-bg-upload"
                                            className={cn(
                                                "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium text-xs cursor-pointer hover:border-primary hover:text-primary transition-all",
                                                uploadingHeroBg && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {uploadingHeroBg ? (
                                                <>
                                                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                    UPLOADING...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} />
                                                    UPLOAD LOCAL {preferences.heroBgType === 'video' ? 'VIDEO' : 'IMAGE'}
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    {/* Preview */}
                                    {preferences.heroBgUrl && (
                                        <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                            {preferences.heroBgType === 'video' ? (
                                                <video
                                                    src={preferences.heroBgUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    autoPlay
                                                />
                                            ) : (
                                                <img
                                                    src={preferences.heroBgUrl}
                                                    className="w-full h-full object-cover"
                                                    alt="Hero background preview"
                                                />
                                            )}
                                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wide text-white">
                                                Preview
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'theme' && (
                        <motion.div
                            key="theme"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-10"
                        >
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-6">Primary Branding Color</h3>
                                <div className="grid grid-cols-6 gap-3 mb-6">
                                    {['#8B1D3D', '#1A1A1A', '#2563EB', '#FF4400', '#059669', '#7C3AED'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => handleUpdate({ primaryColor: color })}
                                            className={cn(
                                                "size-10 rounded-full border-2 transition-all",
                                                preferences.primaryColor === color ? "border-slate-900 scale-110 shadow-lg" : "border-transparent"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                                    <input
                                        type="color"
                                        value={preferences.primaryColor}
                                        onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                                        className="size-10 rounded-lg border-none cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-400 mb-1">CUSTOM HEX</p>
                                        <input
                                            type="text"
                                            value={preferences.primaryColor}
                                            onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                                            className="text-sm font-mono font-medium uppercase outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Secondary text/Background</h3>
                                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                                    <div
                                        className="size-12 rounded-xl border border-slate-200 shadow-inner"
                                        style={{ backgroundColor: preferences.secondaryColor }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-400 mb-1">HEX CODE</p>
                                        <input
                                            type="text"
                                            value={preferences.secondaryColor}
                                            onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                                            className="text-sm font-mono font-medium uppercase outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'typography' && (
                        <motion.div
                            key="typography"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Display Font</h3>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none appearance-none cursor-pointer"
                                    value={preferences.fontFamily}
                                    onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                                >
                                    <option value="Outfit">Outfit (Default)</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                </select>
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'funding' && (
                        <motion.div
                            key="funding"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Funding Organization</h3>
                                <div className="space-y-6">
                                    {/* Logo */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-2 block">LOGO</label>
                                        <div className="flex gap-4 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Logo URL..."
                                                value={preferences.fundingLogoUrl || ''}
                                                onChange={(e) => handleUpdate({ fundingLogoUrl: e.target.value })}
                                                className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                            />
                                            <div className="size-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                                {preferences.fundingLogoUrl ? <img src={preferences.fundingLogoUrl} className="max-w-full max-h-full p-2" /> : <ImageIcon className="text-slate-200" />}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="funding-logo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFundingLogoChange}
                                                disabled={uploadingFundingLogo}
                                            />
                                            <label
                                                htmlFor="funding-logo-upload"
                                                className={cn(
                                                    "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium text-xs cursor-pointer hover:border-primary hover:text-primary transition-all",
                                                    uploadingFundingLogo && "opacity-50 cursor-wait"
                                                )}
                                            >
                                                {uploadingFundingLogo ? "UPLOADING..." : (
                                                    <>
                                                        <Upload size={16} /> UPLOAD LOGO
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-2 block">DESCRIPTION / TEXT</label>
                                        <textarea
                                            rows={3}
                                            value={preferences.fundingText || ''}
                                            onChange={(e) => handleUpdate({ fundingText: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-primary shadow-sm outline-none resize-none"
                                            placeholder="Funded by..."
                                        />
                                    </div>

                                    {/* URL */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-2 block">WEBSITE URL</label>
                                        <input
                                            type="text"
                                            value={preferences.fundingUrl || ''}
                                            onChange={(e) => handleUpdate({ fundingUrl: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. The Preview Engine */}
            <div className="flex-1 bg-slate-200 flex flex-col pt-12">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <DeviceButton
                        icon={<Smartphone size={14} />}
                        active={previewDevice === 'mobile'}
                        onClick={() => setPreviewDevice('mobile')}
                    />
                    <DeviceButton
                        icon={<Tablet size={14} />}
                        active={previewDevice === 'tablet'}
                        onClick={() => setPreviewDevice('tablet')}
                    />
                    <DeviceButton
                        icon={<Monitor size={14} />}
                        active={previewDevice === 'desktop'}
                        onClick={() => setPreviewDevice('desktop')}
                    />
                </div>

                <div className="flex-1 flex items-center justify-center px-10 pb-10">
                    <motion.div
                        layout
                        className={cn(
                            "bg-white rounded-[3rem] shadow-2xl overflow-hidden overflow-y-auto border-[12px] border-slate-900 transition-all duration-700",
                            previewDevice === 'mobile' ? "w-[375px] h-[667px]" :
                                previewDevice === 'tablet' ? "w-[768px] h-[900px]" :
                                    "w-full h-full"
                        )}
                    >
                        {/* Real-time Content Preview */}
                        <div className="p-12 h-full flex flex-col" style={{ fontFamily: preferences.fontFamily }}>
                            <div className="flex items-center justify-between mb-20">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: preferences.primaryColor }}>
                                        {preferences.logoUrl ? <img src={preferences.logoUrl} className="w-full h-full object-contain p-1" /> : <LayoutIcon size={16} />}
                                    </div>
                                    <span className="font-semibold tracking-tight text-xl uppercase" style={{ color: preferences.secondaryColor }}>
                                        {preferences.siteName}
                                    </span>
                                </div>
                                <div className="flex gap-8 text-xs font-semibold uppercase tracking-wide opacity-40">
                                    <span>Materials</span>
                                    <span>Blog</span>
                                    <span>About</span>
                                </div>
                            </div>

                            <div className="max-w-xl flex-1">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white mb-6" style={{ backgroundColor: preferences.primaryColor }}>
                                    Exclusive Academy
                                </span>
                                <h1 className="text-2xl font-semibold tracking-tight mb-6 uppercase leading-[0.9]" style={{ color: preferences.secondaryColor }}>
                                    {preferences.heroTitle ? (
                                        <span dangerouslySetInnerHTML={{ __html: preferences.heroTitle.replace(/\n/g, '<br />') }} />
                                    ) : (
                                        <>LEARNING <br /><span className="italic" style={{ color: preferences.primaryColor }}>REIMAGINED.</span></>
                                    )}
                                </h1>
                                <p className="text-slate-400 font-light text-sm mb-10 leading-relaxed max-w-sm">
                                    {preferences.heroSubtitle}
                                </p>
                                <button
                                    className="px-10 py-5 rounded-full text-white text-xs font-semibold uppercase tracking-wide shadow-xl transition-transform hover:scale-105 cursor-pointer"
                                    style={{ backgroundColor: preferences.primaryColor, boxShadow: `0 10px 30px ${preferences.primaryColor}33` }}
                                >
                                    Get Started
                                </button>
                            </div>

                            <div className="pt-20 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-300 uppercase tracking-wide">
                                <span>© 2026 {preferences.siteName}</span>
                                <div className="flex gap-4">
                                    <span>Privacy</span>
                                    <span>Terms</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const NavButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-semibold text-xs uppercase tracking-wide cursor-pointer",
            active ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        )}
    >
        <div className="flex items-center gap-4">
            {icon}
            <span>{label}</span>
        </div>
        {active && <ChevronRight size={14} />}
    </button>
);

const DeviceButton = ({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-all",
            active ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 hover:text-slate-600 shadow-sm"
        )}
    >
        {icon}
    </button>
);
