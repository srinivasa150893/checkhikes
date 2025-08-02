/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./hike_submission.html", // Add this line
    // Add any other HTML files or directories where you use Tailwind classes
    // Example: "./*.html", "./src/**/*.{html,js,ts,jsx,tsx}" if you have more complex structure
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}