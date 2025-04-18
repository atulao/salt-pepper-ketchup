const config = {
  plugins: ["@tailwindcss/postcss"],
  // Add this for the Tailwind dark mode configuration
  tailwindcss: {
    config: {
      darkMode: 'class',
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {}
      }
    }
  }
};

export default config;