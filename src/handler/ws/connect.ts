import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { Logger } from "../../utils/logger.js";
import { dynamoDbDocClient } from "../../utils/utils.js";
import type { AuthorizerContext } from "../../types/auth.js";

import type { APIGatewayProxyHandler } from "aws-lambda";

// WebSocket $connect handler
// Protected by a CUSTOM Lambda Authorizer configured on $connect.
// The authorizer validates the token and injects user_id/principalId into requestContext.authorizer.
export const connectHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const requestId = event.requestContext?.requestId ?? "unknown";
        const connectionsTable = process.env.CONNECTIONS_TABLE_NAME;

        if (!connectionsTable) {
            Logger.error("Missing CONNECTIONS_TABLE_NAME env var", undefined, { action: "ws_connect" });
            return { statusCode: 500, body: "Server misconfiguration" };
        }

        // Read the authorized user from the authorizer context
        const authorizer = (event.requestContext.authorizer || {}) as AuthorizerContext;
        const userId: string | undefined = authorizer.user_id || authorizer.principalId;
        if (!userId) {
            Logger.warn("Missing user_id/principalId in authorizer context on $connect", {
                action: "ws_connect",
                requestId,
            });
            return { statusCode: 401, body: "Unauthorized" };
        }

        const now = Math.floor(Date.now() / 1000);

        const put = new PutCommand({
            TableName: connectionsTable,
            Item: {
                user_id: userId,
                connectionId,
                isConnected: true,
                lastSeen: now,
            },
        });

        await dynamoDbDocClient.send(put);
        return { statusCode: 200, body: "Connected" };
    } catch (error) {
        Logger.error("$connect failed", error, { action: "ws_connect" });
        return { statusCode: 401, body: "Unauthorized" };
    }
};
