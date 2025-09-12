module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickers', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      symbol: { type: Sequelize.STRING(10), unique: true, allowNull: false },
      name: { type: Sequelize.TEXT, allowNull: false },
      exchange: { type: Sequelize.STRING, allowNull: true },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tickers');
  }
};
