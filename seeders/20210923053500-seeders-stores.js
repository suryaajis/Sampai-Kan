'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface) => {
    let data = JSON.parse(fs.readFileSync('./data/stores.json', 'utf-8'))
    data.forEach(el => { el.createdAt = new Date(); el.updatedAt = new Date() })
    return queryInterface.bulkInsert('Stores', data)
  },
  down: (queryInterface) => queryInterface.bulkDelete('Stores', null, {})
};
