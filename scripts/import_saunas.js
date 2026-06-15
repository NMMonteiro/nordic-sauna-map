import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import fetch from 'node-fetch';

const firebaseConfig = {
  apiKey: "AIzaSyBvmNB75LGrGEeJxe5qiJpww3oOiP6c65I",
  authDomain: "nordic-saunas.firebaseapp.com",
  projectId: "nordic-saunas",
  storageBucket: "nordic-saunas.firebasestorage.app",
  messagingSenderId: "1027974178126",
  appId: "1:1027974178126:web:91e96abbc0153c0bf82a1f"
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Robust CSV parser that correctly handles quoted values with newlines and commas
function parseCSV(text) {
    const rows = [];
    let currentVal = '';
    let inQuotes = false;
    let currentRow = [];

    // Clean up carriage returns
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
        const ch = cleanText[i];
        
        if (ch === '"') {
            // Check for escaped double quotes inside quotes
            if (inQuotes && cleanText[i + 1] === '"') {
                currentVal += '"';
                i++; // skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            currentRow.push(currentVal.trim());
            currentVal = '';
        } else if (ch === '\n' && !inQuotes) {
            currentRow.push(currentVal.trim());
            rows.push(currentRow);
            currentRow = [];
            currentVal = '';
        } else {
            currentVal += ch;
        }
    }
    // Push last cell/row if any
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
    }

    const SIGNALS = {
        sheet_id: ['id', 'sheet_id', 'no.', 'number'],
        name: ['sauna_name', 'sauna name', 'name', 'title'],
        sauna_type: ['sauna_type', 'sauna type', 'type', 'category'],
        country: ['country', 'land'],
        region: ['region', 'city', 'area', 'location'],
        coordinates_raw: ['coordinates', 'coords', 'google maps', 'maps format'],
        description_short: ['description_short', 'short_description', 'short description', 'summary'],
        text_en: ['text_eng', 'text_en', 'english description', 'english'],
        text_sv: ['text_swe', 'text_sv', 'swedish description', 'swedish'],
        text_fi: ['text_fin', 'text_fi', 'finnish description', 'finnish'],
        website: ['website', 'link', 'web', 'website_link'],
        featured_image: ['featured image', 'image_url', 'featured image_url', 'main image', 'photo'],
        gallery_raw: ['gallery', 'extra images', 'extra images_url_gallery', 'images'],
        video_url: ['video', 'youtube', 'video_url'],
        audio_url: ['audio', 'podcast', 'audio_clip_link'],
        verified: ['verified', 'status']
    };

    // Find the header row by checking which row contains the most keyword matches
    let bestHeaderIdx = -1;
    let maxSignals = 0;
    let detectedHeaders = [];

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const cols = rows[i].map(c => c.toLowerCase().trim());
        let signalsFound = 0;
        cols.forEach(col => {
            if (!col) return;
            const matches = Object.values(SIGNALS).some(sigList => 
                sigList.some(sig => col === sig || col.includes(sig))
            );
            if (matches) signalsFound++;
        });

        if (signalsFound > maxSignals) {
            maxSignals = signalsFound;
            bestHeaderIdx = i;
            detectedHeaders = cols;
        }
    }

    // Build header index mapping
    const mapping = {};
    detectedHeaders.forEach((h, idx) => {
        if (!h) return;
        
        // 1. Try exact matches first to prevent substring collision
        let matchedKey = Object.keys(SIGNALS).find(k => 
            SIGNALS[k].some(sig => h === sig)
        );

        // 2. Fallback to substring matching if no exact match is found
        if (!matchedKey) {
            matchedKey = Object.keys(SIGNALS).find(k => 
                SIGNALS[k].some(sig => h.includes(sig))
            );
        }

        if (matchedKey) {
            mapping[idx] = matchedKey;
        }
    });

    const parsedRows = [];
    const nameIdx = detectedHeaders.findIndex(h => mapping[detectedHeaders.indexOf(h)] === 'name');

    for (let i = bestHeaderIdx + 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length === 0 || !cols.join('').trim() || (nameIdx >= 0 && !cols[nameIdx]?.trim())) continue;
        
        const row = {};
        cols.forEach((val, idx) => {
            const key = mapping[idx] || `extra_${idx}`;
            row[key] = val.trim();
        });
        parsedRows.push(row);
    }

    return parsedRows;
}

// Helper to Clean/Resolve URLs
function resolveGoogleDriveUrl(url) {
    if (!url) return '';
    const driveFileMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]{25,})/);
    if (driveFileMatch && driveFileMatch[1]) {
        const id = driveFileMatch[1];
        return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
}

// Scrape Website URL for cover image and gallery images
async function scrapeImagesAndGalleryFromWebsite(url) {
    const result = { featuredImage: null, gallery: [] };
    if (!url || url === '[URL]' || !url.startsWith('http')) return result;
    try {
        console.log(`Scraping website for images: ${url}`);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 8000
        });
        if (!response.ok) return result;
        const html = await response.text();

        // 1. Find og:image
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
            let scrapedUrl = ogImageMatch[1];
            if (scrapedUrl.startsWith('/')) {
                const urlObj = new URL(url);
                scrapedUrl = urlObj.origin + scrapedUrl;
            }
            result.featuredImage = scrapedUrl;
        }

        // 2. Find other images for gallery
        const imgRegex = /<img\s+[^>]*src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi;
        let match;
        const seenUrls = new Set();
        if (result.featuredImage) seenUrls.add(result.featuredImage);

        while ((match = imgRegex.exec(html)) !== null) {
            let imgUrl = match[1];
            if (imgUrl.startsWith('//')) {
                imgUrl = 'https:' + imgUrl;
            } else if (imgUrl.startsWith('/')) {
                const urlObj = new URL(url);
                imgUrl = urlObj.origin + imgUrl;
            } else if (!imgUrl.startsWith('http')) {
                const urlObj = new URL(url);
                imgUrl = urlObj.origin + '/' + imgUrl;
            }

            const lowerUrl = imgUrl.toLowerCase();
            // Filter out tracking pixels, icons, logos, flags or avatar images
            if (
                !lowerUrl.includes('logo') && 
                !lowerUrl.includes('icon') && 
                !lowerUrl.includes('avatar') && 
                !lowerUrl.includes('marker') && 
                !lowerUrl.includes('flag') &&
                !lowerUrl.includes('pixel') &&
                !seenUrls.has(imgUrl)
            ) {
                seenUrls.add(imgUrl);
                result.gallery.push(imgUrl);
            }
            if (result.gallery.length >= 6) break; // Limit gallery size
        }

        // If no og:image was found, use the first gallery image as featured
        if (!result.featuredImage && result.gallery.length > 0) {
            result.featuredImage = result.gallery.shift();
        }

        if (result.featuredImage) {
            console.log(`  Found cover image: ${result.featuredImage}`);
        }
        if (result.gallery.length > 0) {
            console.log(`  Found ${result.gallery.length} gallery images.`);
        }
    } catch (e) {
        console.error(`  Failed to scrape images from ${url}: ${e.message}`);
    }
    return result;
}

// Process data and write to Firestore
async function run() {
    const cleanMode = process.argv.includes('--clean');
    const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/1GnFRRYtZVeb9y0eDCYOtlRRsMhwhvloAY84ququI7cw/export?format=csv';
    
    if (cleanMode) {
        console.log('Clean overwrite mode enabled. Deleting existing sheet imported saunas first...');
        try {
            const saunasCol = collection(db, 'saunas');
            const q = query(saunasCol, where('source', '==', 'sheet_import'));
            const snap = await getDocs(q);
            for (const doc of snap.docs) {
                await deleteDoc(doc.ref);
            }
            console.log(`Successfully deleted ${snap.size} existing saunas.`);
        } catch (cleanErr) {
            console.error(`Error cleaning saunas: ${cleanErr.message}`);
        }
    }

    console.log('Downloading Google Sheet data...');
    
    const response = await fetch(sheetCsvUrl);
    if (!response.ok) {
        console.error('Failed to download Google Sheet.');
        return;
    }

    const text = await response.text();
    const rows = parseCSV(text);
    console.log(`Parsed ${rows.length} rows successfully.`);

    let importCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const name = r.name || 'Unnamed Sauna';
        console.log(`Processing [${i + 1}/${rows.length}] - ${name}...`);

        let lat = 0, lng = 0;
        if (r.latitude && r.longitude) {
            lat = parseFloat(r.latitude.replace(',', '.')) || 0;
            lng = parseFloat(r.longitude.replace(',', '.')) || 0;
        } else if (r.coordinates_raw) {
            const coordStr = r.coordinates_raw.replace(/\s/g, '').replace(';', ',');
            const parts = coordStr.split(',');
            if (parts.length >= 2) {
                lat = parseFloat(parts[0].replace(',', '.')) || 0;
                lng = parseFloat(parts[1].replace(',', '.')) || 0;
            }
        }

        let featuredImage = r.featured_image && r.featured_image !== '[URL]' ? r.featured_image : '';
        if (featuredImage.startsWith('http')) {
            featuredImage = resolveGoogleDriveUrl(featuredImage);
        }

        const website = r.website && r.website !== '[URL]' && r.website.startsWith('http') ? r.website : '';

        let galleryUrls = (r.gallery_raw || '')
            .split(/[,;\n\r]/)
            .map(u => u.trim())
            .filter(u => u && u !== '[URL]')
            .map(u => u.startsWith('http') ? resolveGoogleDriveUrl(u) : u)
            .filter(u => u.startsWith('http'));

        // Scrape images/gallery if featured image or gallery is empty but website exists
        if ((!featuredImage || galleryUrls.length === 0) && website) {
            const scraped = await scrapeImagesAndGalleryFromWebsite(website);
            if (!featuredImage && scraped.featuredImage) {
                featuredImage = scraped.featuredImage;
            }
            if (galleryUrls.length === 0 && scraped.gallery.length > 0) {
                galleryUrls = scraped.gallery;
            }
        }

        // Normalize country string
        let rawCountry = r.country || 'Sweden';
        if (typeof rawCountry === 'string' && rawCountry) {
            rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
        } else {
            rawCountry = 'Sweden';
        }

        const docData = {
            sauna_id: r.sheet_id ? `sheet_${r.sheet_id}` : `imp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            status: 'approved',
            country: rawCountry,
            coordinates: { lat, lng },
            metadata: {
                country: rawCountry,
                region: r.region || '',
                type: r.sauna_type || '',
                verified: (r.verified || '').toLowerCase() === 'true',
            },
            content: {
                en: {
                    name,
                    short_description: r.description_short || '',
                    description: r.text_en || r.description_short || '',
                    etiquette: '',
                },
                sv: {
                    name,
                    short_description: r.description_short || '',
                    description: r.text_sv || r.description_short || '',
                    etiquette: '',
                },
                fi: {
                    name,
                    short_description: r.description_short || '',
                    description: r.text_fi || r.description_short || '',
                    etiquette: '',
                },
            },
            media: {
                featured_image: featuredImage,
                images: galleryUrls,
                audio_interviews: r.audio_url && r.audio_url !== '[URL]' && r.audio_url.startsWith('http')
                    ? [{ title: 'Audio', url: resolveGoogleDriveUrl(r.audio_url) }]
                    : [],
                video_clips: r.video_url && r.video_url !== '[URL]' && r.video_url.startsWith('http')
                    ? [{ title: 'Video', url: resolveGoogleDriveUrl(r.video_url) }]
                    : [],
            },
            contact: {
                website: website,
            },
            created_at: new Date().toISOString(),
            source: 'sheet_import',
        };

        try {
            // Upsert / overwrite to prevent duplicates
            const saunasCol = collection(db, 'saunas');
            const q = query(saunasCol, where('sauna_id', '==', docData.sauna_id));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                // Update
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, docData);
                console.log(`  Updated existing sauna document.`);
            } else {
                // Add
                await addDoc(saunasCol, docData);
                console.log(`  Added new sauna document.`);
            }
            importCount++;
        } catch (dbErr) {
            console.error(`  Error writing to Firestore: ${dbErr.message}`);
        }
    }

    console.log(`\nImport complete! Ingested/Updated ${importCount} sauna records in Firestore.`);
}

run();
