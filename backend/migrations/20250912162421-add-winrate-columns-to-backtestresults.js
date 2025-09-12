'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('backtest_results', 'win_rate', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('backtest_results', 'wins', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('backtest_results', 'losses', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('backtest_results', 'win_rate');
    await queryInterface.removeColumn('backtest_results', 'wins');
    await queryInterface.removeColumn('backtest_results', 'losses');
  },
};
