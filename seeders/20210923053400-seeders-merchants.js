'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: (queryInterface) => {
    const hash = (p) => bcrypt.hashSync(p, 10)
    return queryInterface.bulkInsert('Merchants', [
      {
        fullName: 'Sari Wulandari',
        email: 'sari@warungmamasari.id',
        password: hash('password123'),
        phone: '81234567890',
        profileUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Sari',
        StoreId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Budi Santoso',
        email: 'budi@grillstation.id',
        password: hash('password123'),
        phone: '82198765432',
        profileUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Budi',
        StoreId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Rina Kusuma',
        email: 'rina@minumancamilan.id',
        password: hash('password123'),
        phone: '83156789012',
        profileUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Rina',
        StoreId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },
  down: (queryInterface) => queryInterface.bulkDelete('Merchants', null, {})
};
