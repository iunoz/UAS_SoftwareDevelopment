import admin from 'firebase-admin';

// Load Firebase service account from environment variable
let serviceAccount = {};
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('Firebase service account loaded:', serviceAccount.project_id ? 'project_id found' : 'project_id missing');
} catch (error) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', error);
}

// Inisialisasi Firebase Admin SDK
if (!admin.apps.length) {
  if (serviceAccount && serviceAccount.project_id) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.error('Invalid Firebase service account credentials. Initialization skipped.');
  }
}

export default admin;
