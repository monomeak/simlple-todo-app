// todo-mini-api/src/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";

const createSwaggerSpec = (version: "v1" | "v2") => swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo Mini API",
      version,
      description: `API documentation for Todo Mini App ${version}`,
    },
    servers: [
      {
        url: `http://localhost:3000/api/${version}`,
        description: `Local development server ${version}`,
      },
    ],
    components: {
      securitySchemes: {
        refreshCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refresh_token",
          description:
            "HTTP-only refresh token cookie used only by /auth/refresh and /auth/logout.",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Paste only the access_token value from login/register. Swagger UI will add the Bearer prefix.",
        },
      },
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "uuid-value" },
            name: { type: "string", example: "Work" },
          },
        },
        CreateCategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Personal" },
          },
        },
      },
    },
  },
  apis: [`./src/routes/${version}/*.ts`],
});

export const swaggerV1Spec = createSwaggerSpec("v1");
export const swaggerV2Spec = createSwaggerSpec("v2");
