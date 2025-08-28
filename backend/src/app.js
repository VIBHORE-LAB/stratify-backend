import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import initPassport from './config/passport.js';
import routes from './routes/index.js';
import db from './models/index.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

initPassport();

db.sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(" DB connection error:", err));

app.use('/api', routes);

app.get('/health', (_, res) => res.json({ ok: true }));

export default app;
