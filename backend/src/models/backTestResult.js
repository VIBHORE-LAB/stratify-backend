import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class BackTestResult extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Strategy, { foreignKey: "strategyId" });
      this.hasMany(models.Trade, { foreignKey: "resultId" });
    }
  }

  BackTestResult.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      strategyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      finalNav: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
      },
      startingNav: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        defaultValue: 100000,
      },
      pctChange: {
        type: DataTypes.DECIMAL(9, 4),
        allowNull: false,
      },
      cash: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      navFile: {
        type: DataTypes.STRING,
      },
      tradesFile: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "BackTestResult",     
      tableName: "backtest_results",    
      underscored: true,
    }
  );

  return BackTestResult;
};
