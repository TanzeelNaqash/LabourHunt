export default {
    // Service URLs
    services: {
     
      admin: {
        url: process.env.ADMIN_SERVICE_URL ,
        routes: ['/api/v1/admin']
      },
      user: {
        url: process.env.USER_SERVICE_URL ,
        routes: ['/api/v1/users']
      },
      worker: {
        url: process.env.WORKER_SERVICE_URL ,
        routes: ['/api/v1/workers']
      }
    },
  
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500 // limit each IP to 100 requests per windowMs
    },
  
    // Security
    security: {
      cors: {
        origin: process.env.CLIENT_URL ,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
      }
    },
  
    // Logging
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'combined'
    }
};