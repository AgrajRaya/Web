/********************************************************************************
*  WEB322 – Assignment 04
*  Name: Agraj Raya Student ID: 147863237 Date: 2025-02-02
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Agraj Raya Student ID: 147863237 Date: 2025-03-04
********************************************************************************/

const express = require('express');
const siteData = require("./module/data-service"); 
const path = require("path");
const router = express.Router();


const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Initialize site data
siteData.initialize()
  .then(() => {
    console.log("Site data initialized.");

    // Serve home page
    app.get('/', (req, res) => {
      res.render('home');
    });

    // Serve about page
    app.get('/about', (req, res) => {
      res.render('about');
    });

    // Handle the "/sites" route with query parameters
    app.get('/sites', (req, res) => {
      const { region, provinceOrTerritory } = req.query;

      if (region) {
        // If region is provided, filter by region
        siteData.getSitesByRegion(region)
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      } else if (provinceOrTerritory) {
        // If provinceOrTerritory is provided, filter by province or territory
        siteData.getSitesByProvinceOrTerritoryName(provinceOrTerritory)
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      } else {
        // If no query parameters, return all sites
        siteData.getAllSites()
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      }
    });

    // Dynamic route for individual sites by siteId
    app.get('/sites/:siteId', (req, res) => {
      const { siteId } = req.params;
      siteData.getSiteById(siteId)
        .then(site => res.render("site", { site }))
        .catch(err => res.status(404).send(err));
    });

    // Add route for GET /addSite
    app.get('/addSite', (req, res) => {
      siteData.getAllProvincesAndTerritories()
        .then(provincesAndTerritories => {
          // Render the addSite view with provincesAndTerritories
          res.render('addSite', { provincesAndTerritories });
        })
        .catch(err => {
          // Handle errors and show 500 page if something goes wrong
          res.render('500', { message: `Unable to retrieve provinces and territories: ${err}` });
        });
    });

    // POST /addSite
app.post('/addSite', (req, res) => {
  const newSiteData = req.body;  
  siteData.addSite(newSiteData)  
    .then(() => {
      res.redirect('/sites');
    })
    .catch(err => {
      res.render('500', { message: `Sorry, but we encountered the following error: ${err}` });
    });
});

 // Add route for GET /editSite/:siteId
 app.get('/editSite/:siteId', (req, res) => {
  const { siteId } = req.params;
  Promise.all([siteData.getSiteById(siteId), siteData.getAllProvincesAndTerritories()])
    .then(([site, provincesAndTerritories]) => {
      res.render('editSite', { site, provincesAndTerritories });
    })
    .catch(err => {
      res.render('500', { message: `Unable to retrieve site or provinces and territories: ${err}` });
    });
});

app.post("/editSite", (req, res) => {
  const id = req.body.id;
  const siteDataObj = req.body;

  siteData.editSite(id, siteDataObj)
    .then(() => {
      res.redirect("/sites");
    })
    .catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// Add route for DELETE site by siteId
app.get('/deleteSite/:id', (req, res) => {
  const siteId = req.params.id;

  siteData.deleteSite(siteId)
    .then(() => {
      // Redirect to the sites page after successful deletion
      res.redirect('/sites');
    })
    .catch((err) => {
      // If an error occurs, render the 500 page
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
})

    // 404 route for unmatched URLs
    app.use((req, res) => {
      res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
    });

    // Start the server
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

  })
  .catch(err => {
    console.error("Failed to initialize site data:", err);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // Still start the server in case of failure
  });
