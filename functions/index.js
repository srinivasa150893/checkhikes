/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
// Import setGlobalOptions
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {defineSecret} = require("firebase-functions/params");
const axios = require("axios");
const logger = require("firebase-functions/logger");

// Set the default region for all 2nd Gen functions in this file to Mumbai
setGlobalOptions({region: "asia-south1"});

// Initialize the Firebase Admin SDK
initializeApp();

// Define the reCAPTCHA secret key using Firebase's recommended secret mgmt
const RECAPTCHA_SECRET_KEY = defineSecret("RECAPTCHA_SECRET_KEY");

/**
 * A callable Cloud Function to receive, validate, and store hike data.
 */
exports.submitHikeData = onCall({
  secrets: [RECAPTCHA_SECRET_KEY],
}, async (request) => {
  // --- 1. reCAPTCHA Verification ---
  const recaptchaToken = request.data.recaptchaToken;
  if (!recaptchaToken) {
    logger.warn("reCAPTCHA token missing.");
    throw new HttpsError(
        "invalid-argument",
        "reCAPTCHA validation failed. Please try again.",
    );
  }

  const secretKey = RECAPTCHA_SECRET_KEY.value();

  const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?" +
    `secret=${secretKey}&response=${recaptchaToken}`;

  try {
    const response = await axios.post(verificationUrl);
    const {success, score, action} = response.data;

    if (!success || score < 0.3 || action !== "submitHike") {
      logger.error("reCAPTCHA verification failed.", response.data);
      throw new HttpsError(
          "unauthenticated",
          "reCAPTCHA check failed. You might be a bot.",
      );
    }
    logger.info("reCAPTCHA verification successful.");
  } catch (error) {
    logger.error("Error during reCAPTCHA API call:", error);
    throw new HttpsError(
        "internal",
        "An internal error occurred during reCAPTCHA verification.",
    );
  }

  // --- 2. Data Validation and Sanitization ---
  const {
    companyName,
    designation,
    annualSalary,
    hikeYear,
    hikePercentage,
  } = request.data;

  // Check for presence and basic type
  if (
    !companyName || typeof companyName !== "string" ||
    !designation || typeof designation !== "string" ||
    !annualSalary || typeof annualSalary !== "number" ||
    !hikeYear || typeof hikeYear !== "number" ||
    !hikePercentage || typeof hikePercentage !== "number"
  ) {
    throw new HttpsError("invalid-argument",
        "Invalid data types or missing fields.");
  }

  // Sanitize string inputs
  const sanitizedCompanyName = companyName.trim();
  const sanitizedDesignation = designation.trim();

  // Perform logical validation
  const currentYear = new Date().getFullYear();
  if (sanitizedCompanyName.length > 100 || sanitizedDesignation.length > 100) {
    throw new HttpsError("invalid-argument",
        "Company or Designation name is too long.");
  }
  if (hikeYear < 2010 || hikeYear > currentYear + 1) {
    throw new HttpsError("invalid-argument",
        `Hike Year must be between 2010 and ${currentYear + 1}.`);
  }
  if (annualSalary <= 0 || annualSalary > 1000000000) {
    throw new HttpsError("invalid-argument", "Invalid annual salary amount.");
  }
  if (hikePercentage < 0 || hikePercentage > 1000) {
    throw new HttpsError("invalid-argument", "Hike percentage is unrealistic.");
  }

  // --- 3. Store Data in Firestore ---
  try {
    const db = getFirestore();
    const docRef = await db.collection("hikes").add({
      companyName: sanitizedCompanyName,
      designation: sanitizedDesignation,
      annualSalary: annualSalary,
      hikeYear: hikeYear,
      hikePercentage: hikePercentage,
      submittedAt: FieldValue.serverTimestamp(),
      isApproved: false, // Add an approval flag for moderation
    });

    logger.info(`Successfully stored hike data with document ID: ${docRef.id}`);

    // --- 4. Return Success Response ---
    return {
      success: true,
      message: "Data submitted successfully!",
      docId: docRef.id,
    };
  } catch (error) {
    logger.error("Error writing to Firestore:", error);
    throw new HttpsError("internal",
        "Could not store data. Please try again later.");
  }
});

