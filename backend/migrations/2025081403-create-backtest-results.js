'use strict';
module.exports = {
  async up(q, Sequelize) {
    await q.createTable('backtest_results', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      strategy_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'strategies', key: 'id' }, onDelete: 'CASCADE' },
      final_nav: { type: Sequelize.DECIMAL(18,4), allowNull: false },
      starting_nav: { type: Sequelize.DECIMAL(18,4), allowNull: false, defaultValue: 100000 },
      pct_change: { type: Sequelize.DECIMAL(9,4), allowNull: false },
      cash: { type: Sequelize.DECIMAL(18,4), allowNull: false },
      position: { type: Sequelize.INTEGER, allowNull: false },
      nav_file: { type: Sequelize.STRING },
      trades_file: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(q) { await q.dropTable('backtest_results'); }
};
