const express = require('express');
const siteData = require("./module/data-service"); 
const authData = require('./module/auth-service');
const clientSessions = require("client-sessions"); 
const path = require("path");
const router = express.Router();

const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');

// Database connection
mongoose.connect('mongodb+srv://agraj:gmlmHoeaZBTkDUTO@cluster0.ctd5j4d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection failed:', err);
});


// Session middleware config
app.use(clientSessions({
  cookieName: "session",
  secret: "superSecret1234",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Custom middleware to expose session to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware to protect routes
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));



// Startup initialization chain
siteData.initialize()
  .then(authData.initialize)
  .then(() => {
    console.log("Data and Auth initialized.");

    // Routes
    app.get('/', (req, res) => res.render('home'));

    app.get('/about', (req, res) => res.render('about'));

    app.get('/sites', (req, res) => {
      const { region, provinceOrTerritory } = req.query;

      if (region) {
        siteData.getSitesByRegion(region)
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      } else if (provinceOrTerritory) {
        siteData.getSitesByProvinceOrTerritoryName(provinceOrTerritory)
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      } else {
        siteData.getAllSites()
          .then(sites => res.render('sites', { sites }))
          .catch(err => res.status(404).send(err));
      }
    });

    app.get('/sites/:siteId', (req, res) => {
      siteData.getSiteById(req.params.siteId)
        .then(site => res.render("site", { site }))
        .catch(err => res.status(404).send(err));
    });

    app.get('/addSite', ensureLogin, (req, res) => {
      siteData.getAllProvincesAndTerritories()
        .then(provincesAndTerritories => {
          res.render('addSite', { provincesAndTerritories });
        })
        .catch(err => {
          res.render('500', { message: `Unable to retrieve provinces and territories: ${err}` });
        });
    });

    app.post('/addSite', ensureLogin, (req, res) => {
      const newSiteData = req.body;
      siteData.addSite(newSiteData)
        .then(() => res.redirect('/sites'))
        .catch(err => {
          res.render('500', { message: `Sorry, but we encountered the following error: ${err}` });
        });
    });

    app.get('/editSite/:siteId', ensureLogin, (req, res) => {
      const { siteId } = req.params;
      Promise.all([siteData.getSiteById(siteId), siteData.getAllProvincesAndTerritories()])
        .then(([site, provincesAndTerritories]) => {
          res.render('editSite', { site, provincesAndTerritories });
        })
        .catch(err => {
          res.render('500', { message: `Unable to retrieve site or provinces and territories: ${err}` });
        });
    });

    app.post("/editSite", ensureLogin, (req, res) => {
      const id = req.body.id;
      const siteDataObj = req.body;

      siteData.editSite(id, siteDataObj)
        .then(() => res.redirect("/sites"))
        .catch(err => {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
    });

    app.get('/deleteSite/:id', ensureLogin, (req, res) => {
      const siteId = req.params.id;

      siteData.deleteSite(siteId)
        .then(() => res.redirect('/sites'))
        .catch(err => {
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
    });

// Auth routes

    // GET /login
    app.get('/login', (req, res) => {
      res.render('login', { errorMessage: '', userName: '' });
    });

    // GET /register
    app.get('/register', (req, res) => {
      res.render('register', { errorMessage: '', userName: '' });
    });

    // POST /register
    app.post('/register', (req, res) => {
      authData.registerUser(req.body)
        .then(() => {
          res.render('register', { successMessage: 'User created', errorMessage: '', userName: '' });
        })
        .catch((err) => {
          res.render('register', { errorMessage: err, userName: req.body.userName });
        });
    });

    // POST /login
    app.post('/login', (req, res) => {
      req.body.userAgent = req.get('User-Agent');
      authData.checkUser(req.body)
        .then((user) => {
          req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory,
          };
          res.redirect('/sites');
        })
        .catch((err) => {
          res.render('login', { errorMessage: err, userName: req.body.userName });
        });
    });

    // GET /logout
    app.get('/logout', (req, res) => {
      req.session.reset();
      res.redirect('/');
    });

    // GET /userHistory
    app.get('/userHistory', ensureLogin, (req, res) => {
      res.render('userHistory', { user: req.session.user });
    });

    // 404 route
    app.use((req, res) => {
      res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
    });

    // Start the server
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("Failed to initialize site or auth data:", err);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // Still run server
  });
