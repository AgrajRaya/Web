require('pg'); 
require('dotenv').config();
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('neondb', 'neondb_owner', 'npg_uTvq5K3QBOSH', {
  host: 'ep-dawn-flower-a5ipn7xw-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Authenticate the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

// Define the ProvinceOrTerritory model
const ProvinceOrTerritory = sequelize.define(
  'ProvinceOrTerritory',
  {
    code: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    region: Sequelize.STRING,
    capital: Sequelize.STRING,
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);

// Define the Site model
const Site = sequelize.define(
  'Site',
  {
    siteId: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    site: Sequelize.STRING,
    description: Sequelize.TEXT,
    date: Sequelize.STRING,
    dateType: Sequelize.STRING,
    image: Sequelize.STRING,
    location: Sequelize.STRING,
    latitude: Sequelize.FLOAT,
    longitude: Sequelize.FLOAT,
    designated: Sequelize.INTEGER,
    provinceOrTerritoryCode: Sequelize.STRING,
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);

// Define the association
Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

// Initialize function (Sync the database)
function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synced successfully.');
    })
    .catch((err) => {
      console.log('Error syncing database:', err);
      throw new Error(err);
    });
}

// Get all sites function
function getAllSites() {
  return Site.findAll({
    include: [ProvinceOrTerritory],
  })
    .then((sites) => {
      if (sites.length > 0) {
        return sites;
      } else {
        throw new Error('No sites found');
      }
    })
    .catch((err) => {
      throw new Error('Unable to retrieve sites: ' + err);
    });
}

// Get site by id function
function getSiteById(id) {
  return Site.findAll({
    include: [ProvinceOrTerritory],
    where: {
      siteId: id,
    },
  })
    .then((site) => {
      if (site && site.length > 0) {
        return site[0]; // Return the first site from the array
      } else {
        throw new Error('Unable to find requested site');
      }
    })
    .catch((err) => {
      throw new Error('Unable to retrieve site: ' + err);
    });
}

// Get sites by Province or Territory name function
function getSitesByProvinceOrTerritoryName(provinceOrTerritory) {
  return Site.findAll({
    include: [ProvinceOrTerritory],
    where: {
      '$ProvinceOrTerritory.name$': {
        [Sequelize.Op.iLike]: `%${provinceOrTerritory}%`,
      },
    },
  })
    .then((sites) => {
      if (sites.length > 0) {
        return sites;
      } else {
        throw new Error('Unable to find requested sites');
      }
    })
    .catch((err) => {
      throw new Error('Unable to retrieve sites: ' + err);
    });
}

// Add a new site function
function addSite(siteData) {
  return new Promise((resolve, reject) => {
    Site.create(siteData)
      .then(() => {
        resolve(); // Resolve when the site is created successfully
      })
      .catch(err => {
        reject(err.errors[0].message); 
      });
  });
}

// Get all provinces and territories function
function getAllProvincesAndTerritories() {
  return new Promise((resolve, reject) => {
    ProvinceOrTerritory.findAll()
      .then(provincesAndTerritories => {
        resolve(provincesAndTerritories); // Resolve with the list of provinces and territories
      })
      .catch(err => {
        reject('Failed to retrieve provinces and territories: ' + err.message); // Reject with error message if failed
      });
  });
}

// Edit an existing site function
function editSite(id, siteData) {
  return new Promise((resolve, reject) => {
    Site.update(siteData, {
      where: { siteId: id },
    })
      .then((result) => {
        if (result[0] === 0) {  
          reject(new Error('No site found to update'));
        } else {
          resolve();  
        }
      })
      .catch((err) => {
        reject(err.message);  
      });
  });
}


// Get sites by region function
function getSitesByRegion(region) {
  return Site.findAll({
    include: [ProvinceOrTerritory],
    where: {
      '$ProvinceOrTerritory.region$': {
        [Sequelize.Op.iLike]: `%${region}%`,
      },
    },
  })
    .then((sites) => {
      if (sites.length > 0) {
        return sites;
      } else {
        throw new Error('Unable to find requested sites');
      }
    })
    .catch((err) => {
      throw new Error('Unable to retrieve sites: ' + err);
    });
}

// Function to delete a site by its siteId
function deleteSite(id) {
  return new Promise((resolve, reject) => {
    Site.destroy({
      where: { siteId: id }
    })
    .then(() => {
      resolve();
    })
    .catch((err) => {
      reject(err.errors ? err.errors[0].message : err.message);
    });
  });
}



module.exports = {
  initialize,
  getAllSites,
  getSiteById,
  getSitesByProvinceOrTerritoryName,
  getSitesByRegion,
  getAllProvincesAndTerritories,
  addSite,
  editSite,
  deleteSite,
};
