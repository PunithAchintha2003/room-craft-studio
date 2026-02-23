import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

const startServer = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(Number(env.PORT), () => {
    console.log(`🚀 RoomCraft Studio API running on http://localhost:${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
