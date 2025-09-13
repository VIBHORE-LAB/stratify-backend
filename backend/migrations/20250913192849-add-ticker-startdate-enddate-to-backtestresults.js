'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('backtest_results', 'ticker', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('backtest_results', 'start_date', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('backtest_results', 'end_date', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('backtest_results', 'ticker');
    await queryInterface.removeColumn('backtest_results', 'start_date');
    await queryInterface.removeColumn('backtest_results', 'end_date');
  },
};
