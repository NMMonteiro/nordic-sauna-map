import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-100 rounded-t-[2rem] border-b border-slate-200">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg text-sm font-bold transition-all ${editor.isActive('bold') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg text-sm font-bold transition-all ${editor.isActive('italic') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
            </button>
            <div className="w-px h-8 bg-slate-300 mx-2" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                H3
            </button>
            <div className="w-px h-8 bg-slate-300 mx-2" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg text-sm font-bold transition-all ${editor.isActive('bulletList') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg text-sm font-bold transition-all ${editor.isActive('orderedList') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-lg text-sm font-bold transition-all ${editor.isActive('blockquote') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
                <span className="material-symbols-outlined text-[18px]">format_quote</span>
            </button>
        </div>
    );
};

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-slate max-w-none focus:outline-none min-h-[300px] p-6',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="w-full bg-slate-50 border-none rounded-[2rem] flex flex-col focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
