import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Neon SSL fix
      },
    },
  }
);

for (const file of fs.readdirSync(__dirname)) {
  if (file.endsWith('.js') && file !== basename) {
    const { default: modelInit } = await import(path.join(__dirname, file));
    const model = modelInit(sequelize);
    db[model.name] = model;
  }
}

Object.keys(db).forEach((name) => {
  if (db[name].associate) db[name].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
