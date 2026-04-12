import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { attachSocket } from './sockets/index.js';

async function main() {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);
  const io = attachSocket(httpServer);
  app.set('io', io);

  httpServer.listen(env.port, () => {
    console.log(`AgriSupplyChain API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  if (err?.message?.includes('MONGODB_URI') || err?.name === 'MongoServerSelectionError') {
    console.error('\nCheck MONGODB_URI in .env — local: mongodb://127.0.0.1:27017/agrisupply');
    console.error('Start MongoDB: install MongoDB Community, or run: docker compose -f docker-compose.mongodb.yml up -d\n');
  }
  process.exit(1);
});
