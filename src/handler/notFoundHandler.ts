import type { APIGatewayProxyHandler } from "aws-lambda";
import { responseWithCors } from "../utils/utils.js";

export const handler: APIGatewayProxyHandler = async () => {
  return responseWithCors(404, { message: "Not Found" });
};
