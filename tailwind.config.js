/** @type {import('tailwindcss').Config} */
module.exports = {
 
    content: [`./views/**/*.ejs`], // all .html files
 
    content: [`./views/**/*.html`], // all .html files
     theme: {
      extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {

      themes: ["autumn"], 

      themes: ["fantasy"], 
    },
  };
  