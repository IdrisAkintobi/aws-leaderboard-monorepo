import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Logger } from "../../utils/logger.js";
import { dynamoDbDocClient, httpResponse } from "../../utils/utils.js";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { SEVEN_DAYS_IN_SECONDS } from "../../utils/constants.js";
import { cognitoClient } from "../../utils/utils.js";

// Helper to decode JWT without verification
function decodeJwt(token: string): { sub: string; exp?: number } {
    try {
        const payload = token.split('.')[1] as string;
        return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    } catch (e) {
        throw new Error('Invalid token format');
    }
}

export const connectHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const connectionsTable = process.env.WS_CONNECTIONS_TABLE_NAME;

        const token = event.queryStringParameters?.token;
        if (!token) {
            return httpResponse(401, { error: "Authorization token is required" });
        }

        // Check token expiry
        const jwtPayload = decodeJwt(token);
        if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
            return httpResponse(401, { error: "Token expired" });
        }

        // Verify token using Cognito
        let userId: string;
        try {
            const command = new GetUserCommand({
                AccessToken: token,
            });
            await cognitoClient.send(command); // Validates token
            userId = jwtPayload.sub; // Use sub from access token
        } catch (error: any) {
            if (
                error.name === 'NotAuthorizedException' ||
                error.name === 'InvalidParameterException'
            ) {
                return httpResponse(401, { error: "Invalid or expired token" });
            }
            Logger.error("Cognito GetUser failed", { error: error.message });
            return httpResponse(500, { error: "Internal server error" });
        }

        const now = Math.floor(Date.now() / 1000);
        const ttl = now + SEVEN_DAYS_IN_SECONDS;

        const put = new PutCommand({
            TableName: connectionsTable,
            Item: {
                connectionId,
                userId,
                ttl,
            },
        });

        await dynamoDbDocClient.send(put);

        return httpResponse(200, {
            message: "Connected successfully",
            connectionId,
            userId,
        });
    } catch (error: any) {
        Logger.error("WebSocket connection failed", { error: error.message, action: "ws_connect" });
        return httpResponse(500, { error: "Connection failed" });
    }
};