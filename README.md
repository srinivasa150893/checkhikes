CheckHikes Website

This project is a web application designed to collect anonymous hike data, including company, designation, annual salary, and hike percentage. It uses Firebase for secure backend operations and Tailwind CSS for modern styling.

Features
Anonymous Data Submission: Users can submit their hike data without requiring personal identification.

Secure Backend: Data is securely processed and stored using Firebase Cloud Functions and Firestore.

Spam Protection: Integrated Google reCAPTCHA v3 to prevent automated submissions.

Responsive Design: Built with Tailwind CSS for a modern and mobile-friendly user interface.

Static Hosting: Deployed efficiently using Firebase Hosting.

Technologies Used
Frontend: HTML, CSS (Tailwind CSS), JavaScript

Backend: Firebase (Firestore, Cloud Functions)

Security: Google reCAPTCHA v3

Build Tools: Node.js, npm, Firebase CLI, PostCSS, Autoprefixer

Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js & npm: Download and install from nodejs.org.

Git: For cloning the repository.

Firebase CLI: Install globally via npm:

npm install -g firebase-tools

After installation, log in to Firebase:

firebase login

Google Account: Required to set up Firebase and reCAPTCHA.

Setup Instructions
Follow these steps to get the project up and running locally and deploy it.

1. Clone the Repository
First, clone your project from GitHub to your local machine:

git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME # Navigate into your project directory

(Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual GitHub details)

2. Firebase Project Setup (Google Cloud Console)
You need to set up a Firebase project and configure its services.

Create a Firebase Project:

Go to .

Click "Add project" and follow the prompts to create a new project (e.g., purchasing-power-app).

Enable Firestore Database:

In your Firebase project, navigate to "Firestore Database" under the "Build" section.

Click "Create database" and choose "Start in test mode" for initial development (remember to update rules for production!).

Select your preferred region (e.g., asia-south1 for Mumbai).

Enable Cloud Functions (Blaze Plan):

Cloud Functions require your Firebase project to be on the Blaze (pay-as-you-go) plan.

In your Firebase project, go to "Usage and billing" and upgrade to Blaze. You will only be charged if your usage exceeds the generous free tier.

Add a Web App and Get Firebase Config:

In your Firebase project, go to "Project settings" (gear icon).

Scroll down to "Your apps" and click the </> (Web) icon.

Register your app (e.g., CheckHikesWeb).

Copy the firebaseConfig object provided. You will need this for firebase-config.js.

Set up Google reCAPTCHA v3:

Go to .

Register a new site:

Label: checkhikes-submission

reCAPTCHA type: reCAPTCHA v3

Domains: Add localhost and your deployed domain (e.g., purchasing-power-app.web.app).

Copy your Site Key (public) and Secret Key (private).

3. Local Project Setup
Now, configure your local project with the Firebase details.

Add Firebase Configuration:

Open firebase-config.js in your project's root directory.

Paste the firebaseConfig object you copied from Firebase Console (Step 2.4) into this file. It should look like this:

Ensure all placeholder values are replaced with your actual Firebase project details.

Install Node.js Dependencies:

In your project's root directory, install the necessary npm packages for Tailwind CSS and Firebase Functions:

Navigate into the functions directory:

Install Cloud Functions dependencies:

(Note: node-fetch@2 is used for CommonJS compatibility. firebase-functions@5.0.0 and firebase-admin@12.0.0 are specific versions known to work together and support Node.js 18 runtime.)

Go back to your project root:

Configure Firebase Functions Environment Variable (reCAPTCHA Secret Key):

This is crucial for securely verifying reCAPTCHA on the server.

In your project's root directory, run:

Replace YOUR_RECAPTCHA_SECRET_KEY with the Secret Key you obtained from reCAPTCHA Admin Console (Step 2.5).

Deploy Cloud Functions:

Open functions/index.js and ensure your function is defined with the correct region:

(Replace asia-south1 with your chosen Firestore region if different).

From your project's root directory, deploy your function:

Configure Firebase Security Rules:

Go to your  -> "Firestore Database" -> "Rules" tab.

Update your rules to prevent direct client writes and allow your Cloud Function to write:

Click "Publish".

Build Tailwind CSS:

From your project's root directory, generate your optimized CSS file:

This command uses the script defined in package.json to process src/input.css and create public/output.css.

4. Running Locally
To test your website and functions locally using the Firebase Emulators:

From your project's root directory, start the emulators:

The emulators will provide local URLs (e.g., http://localhost:5000 for Hosting, http://localhost:5001 for Functions).

Open your browser to the Hosting URL (usually http://localhost:5000) to access your website.

5. Deployment
To deploy your project to Firebase Hosting:

From your project's root directory, deploy your entire project (hosting and functions):

Or, if you only changed frontend files:

Firebase will provide you with your live website URL (e.g., https://YOUR_PROJECT_ID.web.app).

6. Usage
Navigate to the hike_submission.html page on your deployed website or local emulator.

Fill in the form fields.

Check the "I accept the Terms and Conditions" checkbox.

Click "Submit data anonymously".

Upon successful submission, you will see a confirmation message, and the data will appear in your Firestore database in the hikeData collection.

Contributing
Feel free to fork this repository, make improvements, and submit pull requests.

License
This project is open-source and available under the . (You might want to create a LICENSE file in your repo if you want to explicitly state the license).
![checkhikes.com](https://github.com/user-attachments/assets/978de594-793a-44fe-917c-3922e5ef2c7f)
![checkhikes.com](https://github.com/user-attachments/assets/a19ffc27-77ba-43e8-a4d5-1dd19a41ab79)
![checkhikes.com](https://github.com/user-attachments/assets/e044a2fc-3ded-4404-b3f2-eae6bf63ce0b)
![checkhikes.com](https://github.com/user-attachments/assets/4116364d-6f87-466c-a5bd-df694710494a)
![checkhikes.com](https://github.com/user-attachments/assets/2cc50004-c9d7-424a-881e-3d6207ec0d22)
