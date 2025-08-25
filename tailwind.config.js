/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1F2937', // Dark Gray
        'secondary': '#111827', // Darker Gray
        'accent': '#3B82F6', // Blue
        'accent-hover': '#2563EB',
        'text-primary': '#F9FAFB', // Light Gray
        'text-secondary': '#9CA3AF', // Gray
        'border-color': '#374151', // Gray-blue
      }
    },
  },
  plugins: [],
}
