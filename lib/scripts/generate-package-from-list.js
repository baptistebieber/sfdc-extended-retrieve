'use strict';
const path = require('path');
const xmlbuilder = require('xmlbuilder'); 

const xmlOptions = require('../utils/xml-options.js');
const metadata = require('../utils/metadata.js');
const TypeFactory = require('../factories/type-factory.js');
const saveFile = require('../utils/save-file');

const PACKAGE_XML_FILE_NAME = 'package.xml';

module.exports = (filepaths, outputFolder, options) => {
  if(typeof inputFolder === 'undefined' || inputFolder === null) {
    throw new Error('Not enough config options');
  }

  return new Promise((resolve, reject) => {
    const typeFactory = new TypeFactory();

    Promise.all(filepaths
    .map(elem => { return path.relative(inputFolder, elem)})
    .filter(elem => metadata[elem.split(path.sep)[0]] !== undefined)
    .map(elem => { return typeFactory.getType(elem.split(path.sep)[0], elem, inputFolder, outputFolder, options).package() })
    ).then(result => {
      let packageList = {}
      result.forEach(type => {
        for (let key in type) {
          if(!packageList.hasOwnProperty(key)) {
            packageList[key] = [];
          }
          packageList[key].push(...type[key]);
        }
      });

      let types = []
      Object.keys(packageList)
      .sort((a,b) => a.localeCompare(b))
      .forEach(key => {
        let type = {members:[], name: key};
        packageList[key]
        .filter((v, i, a) => a.indexOf(v) === i)
        .forEach(members => {
          type.members.push(members);
        })
        types.push(type);
      });
      let data = {
        "@xmlns": "http://soap.sforce.com/2006/04/metadata",
        types: types
      };

      let xmlContent = xmlbuilder.create('Package', { encoding: 'UTF-8' }).ele(data).end(xmlOptions);
      saveFile(outputFolder + '/' + PACKAGE_XML_FILE_NAME, xmlContent, options);
      resolve()
    })
    .catch((err) => {
      options.logger.log('Error '+PLUGIN_NAME+': '+err.message);
      reject()
    });
  });
};