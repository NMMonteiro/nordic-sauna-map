import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

const categoryTranslations = {
    'Dialogue': { en: 'Dialogue', fi: 'Vuoropuhelu', sv: 'Dialog', ar: 'حوار', uk: 'Діалог' },
    'Pronouns': { en: 'Pronouns', fi: 'Pronominit', sv: 'Pronomen', ar: 'الضمائر', uk: 'Займенники' },
    'Flashcards': { en: 'Flashcards', fi: 'Muistikortit', sv: 'Flashkort', ar: 'بطاقات تعليمية', uk: 'Флешкартки' },
    'Nouns': { en: 'Nouns', fi: 'Substantiivit', sv: 'Substantiv', ar: 'الأسماء', uk: 'Іменники' },
    'Verbs': { en: 'Verbs', fi: 'Verbit', sv: 'Verb', ar: 'الأفعال', uk: 'Дієслова' },
    'Video': { en: 'Video', fi: 'Video', sv: 'Video', ar: 'فيديو', uk: 'Відео' },
    'Basic phrases': { en: 'Basic phrases', fi: 'Perusfraasit', sv: 'Grundläggande fraser', ar: 'عبارات أساسية', uk: 'Основні фрази' }
};

async function migrate() {
    const docRef = doc(db, 'configs', 'education_categories');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        console.log("No categories document found!");
        process.exit(1);
    }
    const data = snap.data();
    console.log("Current items:", data.items);

    if (Array.isArray(data.items) && typeof data.items[0] === 'string') {
        const newItems = data.items.map(cat => ({
            id: cat,
            translations: categoryTranslations[cat] || {
                en: cat, fi: cat, sv: cat, ar: cat, uk: cat
            }
        }));
        await setDoc(docRef, { items: newItems });
        console.log("Migration successful!", newItems);
    } else {
        console.log("Already migrated or empty.");
    }
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
