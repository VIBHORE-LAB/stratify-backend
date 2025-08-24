import fs from 'fs';
import path from 'path';
import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const basename = path.basename(new URL(import.meta.url));
const db = {}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
    }
);
const modelsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname));

for (const file of fs.readdirSync(modelsPath)) {
  if (file.endsWith('.js') && file !== basename) {
    const { default: modelInit } = await import(path.join(modelsPath, file));
    const model = modelInit(sequelize);
    db[model.name] = model;
  }
}

Object.keys(db).forEach(name => {
  if (db[name].associate) db[name].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
