import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Eventra API",
      version: "1.0.0",
      description: "Event & Ticket Booking Platform API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },

  apis: ["./Routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
