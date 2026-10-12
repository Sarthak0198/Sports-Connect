import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sports Connect API running on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🗄️  Supabase Connected: ${config.isSupabaseConfigured() ? 'YES (Live Database)' : 'NO (Demo/Mock Engine Active)'}`);
  console.log(`=======================================================`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
