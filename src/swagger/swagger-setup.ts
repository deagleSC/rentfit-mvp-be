import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../config/swagger';

const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RentFit API Documentation',
  customfavIcon: '/favicon.ico',
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export { swaggerUi, swaggerDocument, swaggerOptions };
