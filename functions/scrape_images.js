const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const URL = require('url').URL;

admin.initializeApp({
  projectId: 'nordic-saunas'
});
const db = admin.firestore();

function getAbsoluteUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return null;
  }
}

function isGoodImage(urlStr) {
  if (!urlStr) return false;
  const lower = urlStr.toLowerCase();
  if (lower.includes('logo')) return false;
  if (lower.includes('icon')) return false;
  if (lower.includes('svg')) return false;
  if (lower.includes('avatar')) return false;
  if (lower.includes('spinner')) return false;
  if (lower.includes('placeholder')) return false;
  if (lower.includes('button')) return false;
  if (lower.includes('banner')) return false;
  // Ignore data URIs
  if (lower.startsWith('data:image')) return false;
  return true;
}

async function scrapeImages(websiteUrl) {
  try {
    const res = await axios.get(websiteUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    const $ = cheerio.load(res.data);
    let images = [];
    
    // 1. OpenGraph Image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && isGoodImage(ogImage)) {
      const abs = getAbsoluteUrl(websiteUrl, ogImage);
      if (abs) images.push(abs);
    }
    
    // 2. Twitter Image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage && isGoodImage(twitterImage)) {
      const abs = getAbsoluteUrl(websiteUrl, twitterImage);
      if (abs && !images.includes(abs)) images.push(abs);
    }

    // 3. Img tags
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && isGoodImage(src)) {
        const abs = getAbsoluteUrl(websiteUrl, src);
        if (abs && !images.includes(abs)) {
          images.push(abs);
        }
      }
    });

    // Return up to 4
    return images.slice(0, 4);
  } catch (error) {
    console.log(`Failed to scrape ${websiteUrl}: ${error.message}`);
    return [];
  }
}

async function run() {
  console.log("Fetching saunas...");
  const snap = await db.collection('saunas').get();
  console.log(`Found ${snap.size} saunas. Processing...`);

  let updatedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const media = data.media || {};
    // Ensure media.images is parsed if it's a string somehow
    let existingImages = [];
    if (typeof media.images === 'string') {
        try { existingImages = JSON.parse(media.images); } catch(e) {}
    } else if (Array.isArray(media.images)) {
        existingImages = media.images;
    }
    
    if (existingImages.length > 0) continue;
    
    let website = data.contact?.website;
    if (!website || website === '[URL]' || website === '') continue;
    // ensure starts with http
    if (!website.startsWith('http')) website = 'https://' + website;

    console.log(`[${doc.id}] Scraping ${website}...`);
    const newImages = await scrapeImages(website);

    if (newImages.length > 0) {
      console.log(` -> Found ${newImages.length} images! Featured: ${newImages[0]}`);
      
      const updatedMedia = {
        ...media,
        images: newImages,
        featured_image: newImages[0]
      };

      await doc.ref.update({
        media: updatedMedia
      });
      updatedCount++;
    } else {
      console.log(` -> No valid images found.`);
    }
    
    // small delay to avoid spamming network
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Done! Successfully scraped and updated ${updatedCount} saunas.`);
}

run().catch(console.error);
