import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initSocket } from './socket/index.js';

const PORT = process.env.PORT || 4000;


const server = http.createServer(app);
const { io, userSockets } = initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export { io, userSockets };
