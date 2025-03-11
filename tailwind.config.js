/** @type {import('tailwindcss').Config} */
module.exports = {
<<<<<<< HEAD
    content: [`./views/**/*.ejs`], // all .html files
=======
    content: [`./views/**/*.html`], // all .html files
>>>>>>> 057687b9cf5baaac1a5916517d5ebba1947ec620
    theme: {
      extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
<<<<<<< HEAD
      themes: ["autumn"], 
=======
      themes: ["fantasy"], 
>>>>>>> 057687b9cf5baaac1a5916517d5ebba1947ec620
    },
  };
  