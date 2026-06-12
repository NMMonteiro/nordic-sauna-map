import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCRlhueFAIhCQYCzItfopIlJxpoDrNrWqo",
    authDomain: "suomiportaat-website.firebaseapp.com",
    projectId: "suomiportaat-website",
    storageBucket: "suomiportaat-website.firebasestorage.app",
    messagingSenderId: "1081910030000",
    appId: "1:1081910030000:web:6a6e3b432998e154655575",
    measurementId: "G-806HMSYVH5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load env vars from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envObj = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        envObj[match[1]] = val;
    }
});

const GEMINI_API_KEY = envObj.VITE_GEMINI_API_KEY;

const langs = ['fi', 'sv', 'ar', 'uk'];
const langNames = {
    en: 'English', fi: 'Finnish', sv: 'Swedish', ar: 'Arabic', uk: 'Ukrainian'
};

async function translate(englishTitle, englishDesc) {
    const prompt = `You are a professional translator. Translate the following learning material title and description from English into: ${langs.map(l => langNames[l]).join(', ')}.
Return ONLY valid JSON with no markdown, no explanation. Keys: ${langs.map(l => `"${l}_title", "${l}_desc"`).join(', ')}.
English title: "${englishTitle}"
English description: "${englishDesc || '(no description)'}"`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        }
    );

    if (!res.ok) {
        throw new Error(`Gemini API Error: ${res.status}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
}

async function run() {
    console.log('Fetching materials...');
    const snapshot = await getDocs(collection(db, 'materials'));
    
    let updatedCount = 0;
    
    for (const document of snapshot.docs) {
        const data = document.data();
        
        // Check if we need to migrate
        if (typeof data.title === 'string' || (data.title && !data.title.fi)) {
            console.log(`\nTranslating: ${typeof data.title === 'string' ? data.title : data.title.en}`);
            
            const engTitle = typeof data.title === 'string' ? data.title : data.title.en;
            const engDesc = typeof data.description === 'string' ? data.description : (data.description?.en || '');
            
            try {
                const parsed = await translate(engTitle, engDesc);
                
                const newTitles = { en: engTitle };
                const newDescs = { en: engDesc };
                
                for (const l of langs) {
                    if (parsed[`${l}_title`]) newTitles[l] = parsed[`${l}_title`];
                    if (parsed[`${l}_desc`]) newDescs[l] = parsed[`${l}_desc`];
                }
                
                await updateDoc(doc(db, 'materials', document.id), {
                    title: newTitles,
                    description: newDescs
                });
                
                console.log(`✅ Success for: ${engTitle}`);
                updatedCount++;
                
                // Rate limiting to avoid Gemini 429
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
                console.error(`❌ Failed for: ${engTitle}`, err.message);
            }
        } else {
            console.log(`⏭️ Skipping (already localized): ${data.title.en || 'Unknown'}`);
        }
    }
    
    console.log(`\n🎉 Done! Translated ${updatedCount} materials.`);
    process.exit(0);
}

run().catch(console.error);
