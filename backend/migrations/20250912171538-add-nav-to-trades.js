'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trades', 'nav', {
      type: Sequelize.DECIMAL(18, 4),
      allowNull: true,
      after: 'timestamp' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('trades', 'nav');
  }
};
