// Foundation Stage 1a. Removed in Stage 1b -- Tailwind v4 uses the
// @tailwindcss/vite plugin instead of a PostCSS pipeline.
// autoprefixer reads the browserslist field in package.json.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
