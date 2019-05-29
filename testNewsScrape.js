// ========================================================
// FOR TESTING PURPOSES ONLY - DELETE AFTER SUCCESSFUL TEST
// ========================================================

const cheerio = require("cheerio");
const axios = require("axios");

axios.get('https://www.newschannel5.com')
  .then(function (response) {
    var $ = cheerio.load(response.data);

    var siteHeading = $('.showcase-big-row h3');

    console.log(siteHeading.text());
    
});