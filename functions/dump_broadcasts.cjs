const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function run() {
  try {
    initializeApp();
    const db = getFirestore();
    console.log('--- Broadcasts ---');
    const broadcasts = await db.collection('broadcasts').orderBy('created_at', 'desc').limit(5).get();
    broadcasts.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
    
    console.log('\n--- Broadcast Recipients (Errors) ---');
    const recipients = await db.collection('broadcast_recipients').orderBy('sent_at', 'desc').limit(10).get();
    recipients.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
