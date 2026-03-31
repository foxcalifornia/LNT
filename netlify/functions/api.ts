import serverless from "serverless-http";
// @ts-ignore - Built file exists after build step  
import app from "../../artifacts/api-server/dist/app.mjs";

export const handler = serverless(app);
