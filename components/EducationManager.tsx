import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface EducationManagerProps {
    materials: any[];
    t: any;
    onRefresh: () => void;
    profile: any;
}

export const EducationManager: React.FC<EducationManagerProps> = ({ materials, t, onRefresh, profile }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        file_path: '',
        thumbnail: ''
    });

    const canManage = (material: any) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;
        return material.created_by === profile.id;
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploading(true);
        const file = e.target.files[0];
        const path = `thumbnails/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('education').upload(path, file);
        if (!error) {
            const { data } = supabase.storage.from('education').getPublicUrl(path);
            setFormData({ ...formData, thumbnail: data.publicUrl });
        }
        setUploading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];

        console.log('Attempting to upload resource:', file.name, file.size, file.type);

        const path = `resources/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const { data, error } = await supabase.storage.from('education').upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

        if (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        } else {
            console.log('Upload successful:', data);
            setFormData(prev => ({ ...prev, file_path: path }));
            alert('File uploaded successfully to storage!');
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalData: any = { ...formData };

        if (formData.type === 'video' && formData.url && !formData.thumbnail) {
            const ytId = getYouTubeId(formData.url);
            if (ytId) {
                finalData.thumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            }
        }

        if (editingId) {
            const { error } = await supabase
                .from('learning_materials')
                .update(finalData)
                .eq('id', editingId);

            if (!error) {
                setShowForm(false);
                setEditingId(null);
                onRefresh();
                setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '' });
                alert('Resource updated successfully!');
            } else {
                alert(`Update failed: ${error.message}`);
            }
        } else {
            finalData.created_by = profile?.id;
            const { error } = await supabase.from('learning_materials').insert(finalData);
            if (!error) {
                setShowForm(false);
                onRefresh();
                setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '' });
                alert('Resource created successfully!');
            } else {
                alert(`Creation failed: ${error.message}`);
            }
        }
    };

    const startEdit = (material: any) => {
        setFormData({
            title: material.title,
            description: material.description,
            type: material.type,
            url: material.url || '',
            file_path: material.file_path || '',
            thumbnail: material.thumbnail || ''
        });
        setEditingId(material.id);
        setShowForm(true);
    };

    const deleteMaterial = async (id: string) => {
        if (!confirm('Delete this resource?')) return;
        const { error } = await supabase.from('learning_materials').delete().eq('id', id);
        if (error) alert(`Delete failed: ${error.message}`);
        onRefresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                    {showForm ? (editingId ? 'Edit Resource' : 'Add New Resource') : 'Educational Resources'}
                </h2>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '' });
                            setShowForm(true);
                        }}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        Add New Resource
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-3xl border-2 border-primary/10 animate-in slide-in-from-top duration-300 mb-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex justify-center mb-4">
                            <div className="relative group cursor-pointer">
                                <input type="file" onChange={handleThumbnailUpload} className="hidden" id="admin-thumb-upload" accept="image/*" />
                                <label htmlFor="admin-thumb-upload" className="block size-48 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group-hover:border-primary/30 transition-all cursor-pointer">
                                    {formData.thumbnail ? (
                                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                            <span className="text-[9px] font-black uppercase">Click to add Thumbnail</span>
                                        </div>
                                    )}
                                </label>
                                {formData.thumbnail && (
                                    <button onClick={(e) => { e.preventDefault(); setFormData({ ...formData, thumbnail: '' }); }} className="absolute -top-2 -right-2 bg-red-500 text-white size-8 rounded-full flex items-center justify-center shadow-xl">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm">
                                <option value="pdf">PDF Download</option>
                                <option value="presentation">Presentation</option>
                                <option value="video">YouTube Video</option>
                                <option value="twee">Twee Interactive</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm h-24" />
                        </div>
                        {formData.type === 'video' || formData.type === 'twee' ? (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-2">URL (YouTube Link or Twee hosted link)</label>
                                <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm" />
                            </div>
                        ) : (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-2">File Upload (PDF/PPTX)</label>
                                <div className="flex gap-4 items-center">
                                    <input type="file" onChange={handleFileUpload} className="hidden" id="admin-file-upload" accept=".pdf,.pptx,.ppt,.docx" />
                                    <label htmlFor="admin-file-upload" className={`px-6 py-4 rounded-2xl font-bold text-sm cursor-pointer transition-all flex-1 flex justify-between items-center ${formData.file_path ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                        <span className="truncate">{uploading ? 'Uploading...' : formData.file_path ? formData.file_path.split('/').pop() : 'Choose File (PDF/PPTX)'}</span>
                                        {formData.file_path && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                                    </label>
                                </div>
                            </div>
                        )}
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                            <button type="submit" disabled={uploading} className={`bg-nordic-lake text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                                {uploading ? 'Processing...' : (editingId ? 'Update Resource' : 'Save Resource')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((m: any) => (
                    <div key={m.id} className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary/40">
                                <span className="material-symbols-outlined">{m.type === 'video' ? 'play_circle' : m.type === 'twee' ? 'interactive_space' : 'description'}</span>
                            </div>
                            <div>
                                <h4 className="font-black text-xs text-slate-900 uppercase">{m.title}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.type}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canManage(m) && (
                                <>
                                    <button onClick={() => startEdit(m)} className="p-2 text-slate-300 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => deleteMaterial(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
