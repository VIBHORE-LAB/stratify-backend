import {DataTypes, Model} from 'sequelize';

export default(sequelize) =>{
    class Trade extends Model{
        static associate(models){
            this.belongsTo(models.BackTestResult,{foreignKey:'resultId'});
        }
    }

    Trade.init({
        id:{type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true},
    resultId: { type: DataTypes.UUID, allowNull: false },
    orderId: { type: DataTypes.STRING, allowNull: false },
    side: { type: DataTypes.ENUM('BUY', 'SELL'), allowNull: false },
    price: { type: DataTypes.DECIMAL(18, 6), allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    nav: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
    timestamp: { type: DataTypes.STRING, allowNull: false }
  }, { sequelize, modelName: 'Trade', tableName: 'trades', underscored: true });

  return Trade;
};
