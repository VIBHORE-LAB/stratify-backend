// models/ticker.ts
import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Ticker extends Model {
    static associate(models) {
      // no associations for now
    }
  }

  Ticker.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      symbol: {
        type: DataTypes.STRING(10),
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      exchange: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Ticker",
      tableName: "tickers",
      timestamps: false, 
      underscored: true, 
    }
  );

  return Ticker;
};
