const siteData = require("../data/NHSiteData");
const provinceData = require("../data/provinceAndTerritoryData");

let sites = [];

//initializing function

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      sites = siteData.map(site => {
        const province = provinceData.find(p => p.code === site.provinceOrTerritoryCode);
        return { ...site, provinceOrTerritoryObj: province };
      });
      resolve();
    } catch (err) {
      reject("Initialization failed: " + err);
    }
  });
}

//function to get all sites

function getAllSites() {
  return new Promise((resolve, reject) => {
    sites.length > 0 ? resolve(sites) : reject("No sites found");
  });
}

//function to get site by id

function getSiteById(id) {
  return new Promise((resolve, reject) => {
    const site = sites.find(s => s.siteId === id);
    site ? resolve(site) : reject("Site not found");
  });
}

//function to get site by province or territory name

function getSitesByProvinceOrTerritoryName(name) {
  return new Promise((resolve, reject) => {
    const filtered = sites.filter(s => 
      s.provinceOrTerritoryObj.name.toLowerCase().includes(name.toLowerCase())
    );
    filtered.length > 0 ? resolve(filtered) : reject("No sites found");
  });
}

//functio to get site by region

function getSitesByRegion(region) {
  return new Promise((resolve, reject) => {
    const filtered = sites.filter(s => 
      s.provinceOrTerritoryObj.region.toLowerCase().includes(region.toLowerCase())
    );
    filtered.length > 0 ? resolve(filtered) : reject("No sites found");
  });
}

module.exports = { initialize, getAllSites, getSiteById, getSitesByProvinceOrTerritoryName, getSitesByRegion };