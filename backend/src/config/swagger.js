const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Primetrade API",
      version: "1.0.0",
      description: "REST API with JWT Auth, RBAC, and Task Management",
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Tell swagger-jsdoc where to find JSDoc comments
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
