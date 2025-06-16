import admin from 'firebase-admin';

let serviceAccount = {};
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase service account loaded:', serviceAccount.project_id ? 'project_id found' : 'project_id missing');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }
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
