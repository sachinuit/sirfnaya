import admin from "firebase-admin";

let isFirebaseInitialized = false;
let missingKeys: string[] = [];

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || projectId.trim() === '') missingKeys.push("FIREBASE_PROJECT_ID");
        if (!clientEmail || clientEmail.trim() === '') missingKeys.push("FIREBASE_CLIENT_EMAIL");
        if (!privateKeyRaw || privateKeyRaw.trim() === '') missingKeys.push("FIREBASE_PRIVATE_KEY");

        if (missingKeys.length > 0) {
            console.warn(`Firebase Admin credentials missing: ${missingKeys.join(", ")}. Firebase auth will fail.`);
        } else {
            let privateKey = privateKeyRaw!;
            if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            } else if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN')) {
                privateKey = privateKey
                    .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                    .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
                    .replace(/(.{65}(?!\n))/g, '$1\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: projectId,
                    clientEmail: clientEmail,
                    privateKey: privateKey,
                }),
            });
            isFirebaseInitialized = true;
            console.log("Firebase Admin initialized successfully");
        }
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
} else {
    isFirebaseInitialized = true;
}

export const firebaseAdmin = admin;
export { isFirebaseInitialized, missingKeys };
