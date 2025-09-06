import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "../../utils/logger.js";
import { dynamoDbDocClient } from "../../utils/utils.js";
import type { APIGatewayProxyHandler } from "aws-lambda";

// WebSocket $disconnect handler
export const disconnectHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const connectionsTable = process.env.CONNECTIONS_TABLE_NAME;
        if (!connectionsTable) {
            Logger.error("Missing CONNECTIONS_TABLE_NAME env var", undefined, { action: "ws_disconnect" });
            return { statusCode: 500, body: "Server misconfiguration" };
        }

        // Find the record by connectionId via GSI
        const findByConnection = new QueryCommand({
            TableName: connectionsTable,
            IndexName: "ConnectionIdIndex",
            KeyConditionExpression: "connectionId = :cid",
            ExpressionAttributeValues: {
                ":cid": connectionId,
            },
            Limit: 1,
        });
        const found = await dynamoDbDocClient.send(findByConnection);
        const item = found.Items && found.Items[0];
        if (!item) {
            // Nothing to update
            return { statusCode: 200, body: "Disconnected" };
        }

        const userId = (item as any).user_id as string;
        const now = Math.floor(Date.now() / 1000);

        const update = new UpdateCommand({
            TableName: connectionsTable,
            Key: { user_id: userId, connectionId },
            UpdateExpression: "SET isConnected = :f, lastSeen = :ts",
            ExpressionAttributeValues: {
                ":f": false,
                ":ts": now,
            },
        });
        await dynamoDbDocClient.send(update);

        return { statusCode: 200, body: "Disconnected" };
    } catch (error) {
        Logger.error("$disconnect failed", error, { action: "ws_disconnect" });
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
