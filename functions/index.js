const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // Import node-fetch

admin.initializeApp(); // Initialize Firebase Admin SDK
const db = admin.firestore(); // Get a reference to Firestore

// This is your reCAPTCHA Secret Key from Part 1.3.
// We will set this securely as an environment variable.
// DO NOT HARDCODE YOUR SECRET KEY HERE!
const RECAPTCHA_SECRET_KEY = functions.config().recaptcha.secret_key;

/**
 * Cloud Function to handle hike data submission with reCAPTCHA verification.
 * It's an HTTPS Callable Function, making it easy to call from your web client.
 */

exports.submitHikeData = functions.region('asia-south1').https.onCall(async (data, context) => {
    const { companyName, designation, annualSalary, hikeYear, hikePercentage, recaptchaToken } = data;

    // --- 1. Basic Server-Side Data Validation ---
    // Always validate on the server, even if client-side validation exists.
    if (!companyName || !designation || annualSalary === undefined || isNaN(annualSalary) ||
        hikeYear === undefined || isNaN(hikeYear) || hikePercentage === undefined || isNaN(hikePercentage)) {
        console.error("Invalid input data:", data);
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Missing or invalid data for one or more fields.'
        );
    }
    if (annualSalary < 0 || hikePercentage < 0 || hikeYear < 1900 || hikeYear > new Date().getFullYear() + 1) {
        console.error("Value out of realistic range.");
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Please provide realistic values for salary, hike percentage, and year.'
        );
    }


    // --- 2. Verify reCAPTCHA Token ---
    if (!recaptchaToken) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'reCAPTCHA token missing. Please refresh and try again.'
        );
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    try {
        const recaptchaResponse = await fetch(verifyUrl, { method: 'POST' });
        const recaptchaJson = await recaptchaResponse.json();

        console.log('reCAPTCHA verification response:', recaptchaJson);

        // Check reCAPTCHA success and score
        // A score of 0.5 is a common threshold. You can adjust this.
        // Lower score means higher likelihood of being a bot.
        if (!recaptchaJson.success || recaptchaJson.score < 0.5) {
            console.warn('reCAPTCHA verification failed or low score for action:', recaptchaJson.action, 'Score:', recaptchaJson.score);
            throw new functions.https.HttpsError(
                'unauthenticated',
                'reCAPTCHA verification failed. Please try again. If the problem persists, you might be flagged as a bot.'
            );
        }

        // Optional: You can also check recaptchaJson.action if you want to ensure the action matches
        // if (recaptchaJson.action !== 'submitHike') {
        //     console.warn('reCAPTCHA action mismatch:', recaptchaJson.action);
        //     throw new functions.https.HttpsError(
        //         'unauthenticated',
        //         'reCAPTCHA action mismatch. Please try again.'
        //     );
        // }

    } catch (recaptchaError) {
        console.error('Error during reCAPTCHA verification:', recaptchaError);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to verify reCAPTCHA. Please try again later.'
        );
    }

    // --- 3. Add Data to Firestore (if reCAPTCHA passes) ---
    const hikeEntry = {
        companyName: companyName,
        designation: designation,
        annualSalary: parseFloat(annualSalary),
        hikeYear: parseInt(hikeYear),
        hikePercentage: parseFloat(hikePercentage),
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
        // You can also add context.auth.uid here if you decide to use Firebase Authentication
        // submittedBy: context.auth ? context.auth.uid : 'anonymous'
    };

    try {
        await db.collection('hikeData').add(hikeEntry);
        console.log('Data successfully written to Firestore:', hikeEntry);
        return { success: true, message: 'Data submitted successfully!' };
    } catch (firestoreError) {
        console.error('Error writing to Firestore:', firestoreError);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to save data to database. Please try again later.'
        );
    }
});