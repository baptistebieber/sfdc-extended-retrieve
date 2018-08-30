'use strict';
const dirTree = require('directory-tree');
const fs = require('fs-extra');
const meta = require('jsforce-metadata-tools');

const extractZipContents = require('../utils/extend-jsforce-metadata-tools.js');

const PLUGIN_NAME = 'retrieve';

module.exports = (packageXmlPath, folderToExtract, options) => {
  if(typeof packageXmlPath === 'undefined' || packageXmlPath === null || typeof folderToExtract === 'undefined' || folderToExtract === null) {
    throw new Error('Not enough config options');
  }
  if(!fs.existsSync(packageXmlPath) || !fs.existsSync(folderToExtract)) {
    throw new Error('The folder of package.xml does not exist');
  }
  return new Promise((resolve, reject) => {
    options.logger.log('Package used: ' + packageXmlPath);
    fs.removeSync(folderToExtract);
    meta.retrieveByPackageXML(packageXmlPath, options)
    .then(res => {
      meta.reportRetrieveResult(res, options.logger, options.verbose);
      if (!res.success) {
        throw new Error(res.errorMessage);
      }
      extractZipContents(res.zipFile, folderToExtract, options.logger, options.verbose);
      delete res.zipFile;
      return res;
    })
    .catch(err => {
      options.logger.log('Error '+PLUGIN_NAME+': '+err.message);
    });
  });
}