import {DataTypes, Model} from 'sequelize';

export default (sequelize) =>{
    class Strategy extends Model{
        static associate (models){
            this.belongsTo(models.User, {foreignKey: 'User'});
            this.hasMany(models.BackTestResult, {foreignKey:'strategyId'});
        }
    }

    Strategy.init({
        id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
        userId:{type: DataTypes.UUID, allowNull: false},
        name:{type: DataTypes.STRING, allowNull:false},
        params:{type:DataTypes.JSONB, allowNull:false},
    
    },{sequelize,modelName:Strategy,tableName:'strategies', underscored: true});

    return Strategy;
}