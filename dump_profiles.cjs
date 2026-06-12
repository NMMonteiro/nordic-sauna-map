const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// We can use the default credentials or a service account if available.
// Let's check if there's a service account or try default.
async function run() {
  try {
    // If not using ADC, this might fail, but let's try.
    initializeApp();
    const db = getFirestore();
    const snapshot = await db.collection('profiles').get();
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
