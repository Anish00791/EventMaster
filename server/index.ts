// Use static imports instead of dynamic ones
import 'dotenv-esm/config';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js'; // Ensure correct extension
import { setupVite, serveStatic, log } from './vite.js'; // Ensure correct extension

const app = express();

app.use(cors({
  origin: ['http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: unknown;
  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: unknown) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith('/api')) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  app.use((err: Error & { status?: number; statusCode?: number }, 
    _req: express.Request, 
    res: express.Response, 
    _next: express.NextFunction
  ) => {
    const status = (err as any).status || (err as any).statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    console.error(err); // Log error instead of throwing in middleware
  });

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  server.listen({ port, host: '0.0.0.0' }, () => {
    log(`serving on port ${port}`);
  });
})().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});