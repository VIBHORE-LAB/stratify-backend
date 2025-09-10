import http from 'http'
import app from './app.js'
import db from './models/index.js'
import { initSocket } from './realtime/socket.js';



const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    const server = http.createServer(app);
    const io = initSocket(server);

    app.set('io', io);

    server.listen(PORT, () => console.log(`Server listening on :${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
