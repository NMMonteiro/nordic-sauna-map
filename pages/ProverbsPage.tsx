import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVERBS, Proverb } from '../proverbsData';
import { Search, ChevronDown, ChevronUp, Link as LinkIcon, BookOpen, Quote, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProverbsPageProps {
    lang: LanguageCode;
}

export const ProverbsPage = ({ lang }: ProverbsPageProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const t = {
        en: {
            title: "Sauna Proverbs",
            subtitle: "Traditional Wisdom",
            intro: "Explore the collection of traditional Finnish and Swedish sauna proverbs, sayings, expressions, and beliefs. These sayings reflect the deep spiritual and cultural significance that the sauna holds in the Nordic heritage.",
            searchPlaceholder: "Search proverbs or explanations...",
            allCategories: "All Categories",
            category: "Category",
            source: "Source",
            readMore: "View explanation",
            readLess: "Hide explanation",
            noResults: "No proverbs match your criteria.",
            explanation: "Context & Meaning",
            categories: {
                "Proverb": "Proverbs",
                "Saying": "Sayings",
                "Expression": "Expressions",
                "Belief": "Beliefs"
            }
        },
        fi: {
            title: "Saunan Sananlaskut",
            subtitle: "Perinteistä Viisautta",
            intro: "Tutustu perinteisiin suomalaisiin ja ruotsalaisiin saunan sananlaskuihin, sanontoihin, ilmauksiin ja uskomuksiin. Nämä viisaudet heijastavat sitä syvää henkistä ja kulttuurista merkitystä, joka saunalla on pohjoismaisessa perinnössä.",
            searchPlaceholder: "Hae sananlaskuja tai selityksiä...",
            allCategories: "Kaikki luokat",
            category: "Luokka",
            source: "Lähde",
            readMore: "Näytä selitys",
            readLess: "Piilota selitys",
            noResults: "Hakuehdoilla ei löytynyt sananlaskuja.",
            explanation: "Konteksti ja Merkitys",
            categories: {
                "Proverb": "Sanonnat",
                "Saying": "Sanonnat",
                "Expression": "Ilmaukset",
                "Belief": "Uskomukset"
            }
        },
        sv: {
            title: "Bastuordspråk",
            subtitle: "Traditionell Visdom",
            intro: "Utforska samlingen av traditionella finländska och svenska bastuordspråk, talesätt, uttryck och folktro. Dessa talesätt återspeglar den djupa andliga och kulturella betydelse som bastun har i det nordiska kulturarvet.",
            searchPlaceholder: "Sök ordspråk eller förklaringar...",
            allCategories: "Alla kategorier",
            category: "Kategori",
            source: "Källa",
            readMore: "Visa förklaring",
            readLess: "Dölj förklaring",
            noResults: "Inga ordspråk matchar dina kriterier.",
            explanation: "Kontext & Betydelse",
            categories: {
                "Proverb": "Ordspråk",
                "Saying": "Talesätt",
                "Expression": "Uttryck",
                "Belief": "Folktro"
            }
        }
    }[lang] || {
        title: "Sauna Proverbs",
        subtitle: "Traditional Wisdom",
        intro: "Explore traditional Finnish and Swedish sauna proverbs, sayings, expressions, and beliefs.",
        searchPlaceholder: "Search...",
        allCategories: "All",
        category: "Category",
        source: "Source",
        readMore: "Show details",
        readLess: "Hide details",
        noResults: "No results.",
        explanation: "Context & Meaning",
        categories: {
            "Proverb": "Proverbs",
            "Saying": "Sayings",
            "Expression": "Expressions",
            "Belief": "Beliefs"
        }
    };

    const categories = ['All', 'Proverb', 'Saying', 'Expression', 'Belief'];

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const filteredProverbs = PROVERBS.filter(proverb => {
        const matchesCategory = selectedCategory === 'All' || proverb.category_en === selectedCategory;
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            proverb.text_fi.toLowerCase().includes(searchLower) ||
            proverb.text_en.toLowerCase().includes(searchLower) ||
            proverb.text_sv.toLowerCase().includes(searchLower) ||
            proverb.description_fi.toLowerCase().includes(searchLower) ||
            proverb.description_en.toLowerCase().includes(searchLower) ||
            proverb.description_sv.toLowerCase().includes(searchLower);

        return matchesCategory && matchesSearch;
    });

    const getCategoryName = (category_en: string) => {
        return (t.categories as any)[category_en] || category_en;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-30">
                <div className="absolute top-[-5%] right-[-10%] w-[60%] h-[50%] bg-blue-50/40 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-sky-50/40 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black tracking-[0.3em] uppercase"
                    >
                        {t.subtitle}
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase leading-[0.9]"
                    >
                        {t.title}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-3xl mx-auto"
                    >
                        {t.intro}
                    </motion.p>
                </div>

                <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none mb-12">
                    <div className="flex flex-col gap-6">
                        <div className="w-full relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="hidden md:flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                        selectedCategory === cat
                                            ? "bg-primary text-white shadow-md shadow-primary/10"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {cat === 'All' ? t.allCategories : getCategoryName(cat)}
                                </button>
                            ))}
                        </div>

                        <div className="w-full md:hidden">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 font-bold text-sm outline-none text-slate-900 dark:text-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat === 'All' ? t.allCategories : getCategoryName(cat)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    {filteredProverbs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8">
                            {filteredProverbs.map((proverb) => {
                                const isExpanded = expandedIds.includes(proverb.id);
                                const categoryName = lang === 'sv' ? proverb.category_sv : lang === 'fi' ? proverb.category_fi : proverb.category_en;
                                
                                return (
                                    <motion.div
                                        key={proverb.id}
                                        layout="position"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50"
                                    >
                                        <div className="p-8 md:p-12 space-y-8">
                                            <div className="flex justify-between items-center">
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                                                    <Quote className="size-3" />
                                                    {categoryName}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-300 dark:text-slate-600">
                                                    #{proverb.id}
                                                </span>
                                            </div>

                                            {/* Proverbs Content */}
                                            <div className="space-y-6">
                                                {/* Main Title Proverb (Current selected language) */}
                                                <div className="space-y-2 pb-6 border-b border-slate-50 dark:border-slate-800/40">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">
                                                            {lang === 'sv' ? '🇸🇪' : lang === 'fi' ? '🇫🇮' : '🇬🇧'}
                                                        </span>
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                            {lang === 'sv' ? 'Svenska' : lang === 'fi' ? 'Suomi' : 'English'}
                                                        </span>
                                                    </div>
                                                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                                        "{lang === 'sv' ? proverb.text_sv : lang === 'fi' ? proverb.text_fi : proverb.text_en}"
                                                    </p>
                                                </div>

                                                {/* Other Two Translations */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-slate-100 dark:md:divide-slate-800/60">
                                                    {lang !== 'fi' && (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base">🇫🇮</span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suomi</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-snug">
                                                                "{proverb.text_fi}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    {lang !== 'sv' && (
                                                        <div className="space-y-2 md:pl-8 first:pl-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base">🇸🇪</span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Svenska</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-snug">
                                                                "{proverb.text_sv}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    {lang !== 'en' && (
                                                        <div className="space-y-2 md:pl-8 first:pl-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base">🇬🇧</span>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">English</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-snug">
                                                                "{proverb.text_en}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center flex-wrap gap-4">
                                                <button
                                                    onClick={() => toggleExpand(proverb.id)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-primary transition-colors"
                                                >
                                                    <Info className="size-4" />
                                                    {isExpanded ? t.readLess : t.readMore}
                                                    {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                                </button>

                                                {proverb.source && (
                                                    <a
                                                        href={proverb.source}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-wider"
                                                    >
                                                        <LinkIcon className="size-3" />
                                                        {t.source}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800"
                                                >
                                                    <div className="p-8 md:p-12 space-y-6">
                                                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-2">
                                                            <BookOpen className="size-4 text-primary" />
                                                            <h5 className="text-xs font-black uppercase tracking-wider">{t.explanation}</h5>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suomi</p>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                                                    {proverb.description_fi || "Ei selitystä saatavilla."}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Svenska</p>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                                                    {proverb.description_sv || "Ingen förklaring tillgänglig."}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">English</p>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                                                    {proverb.description_en || "No explanation available."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-4xl mb-4">search_off</span>
                            <p className="text-sm font-bold uppercase tracking-wider">{t.noResults}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
