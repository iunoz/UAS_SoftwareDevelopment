import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: "json" }; // path ke file credential JSON

// Inisialisasi Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
