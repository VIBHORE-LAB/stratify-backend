'use strict';
module.exports = {
  async up(q, Sequelize) {
    await q.createTable('trades', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      result_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'backtest_results', key: 'id' }, onDelete: 'CASCADE' },
      order_id: { type: Sequelize.STRING, allowNull: false },
      side: { type: Sequelize.ENUM('BUY', 'SELL'), allowNull: false },
      price: { type: Sequelize.DECIMAL(18,6), allowNull: false },
      qty: { type: Sequelize.INTEGER, allowNull: false },
      timestamp: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(q) { await q.dropTable('trades'); }
};
