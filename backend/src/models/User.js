import {DataTypes, Model} from 'sequelize';

export default (sequelize) =>{
    class User extends Model{
        static associate(models){
            this.hasMany(models.Strategy, {foreignKey: 'userId'});
            this.hasMany(models.BackTestResult, {foreignKey: 'userId'});
        }
    }

    User.init({
        id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
        email:{type: DataTypes.STRING, unique: true, allowNull: false},
        passwordHash:{type: DataTypes.STRING, allowNull:false},
        name:{type: DataTypes.STRING}
    },
    {sequelize, modelName: 'User', tableName:'Users', underscored: true});
    return User;
}