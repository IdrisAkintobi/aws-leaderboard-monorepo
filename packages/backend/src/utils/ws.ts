import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "./logger.js";
import { apiGatewayWebSocketClient, dynamoDbDocClient } from "./utils.js";

export interface WebSocketMessage {
    action: string;
    data?: any;
    error?: string;
}

/**
 * Sends a message to a specific WebSocket connection
 */
export const sendToConnection = async (connectionId: string, message: WebSocketMessage): Promise<boolean> => {
    try {
        const postToConnectionCommand = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify(message),
        });
        await apiGatewayWebSocketClient.send(postToConnectionCommand);

        return true;
    } catch (error: any) {
        Logger.error("Error sending WebSocket message", error, {
            connectionId,
            action: message.action,
        });
        return false;
    }
};

/**
 * Broadcasts a message to all connections of a specific user
 */
export const broadcastToUser = async (userId: string, message: WebSocketMessage) => {
    const connectionsTable = process.env.WS_CONNECTIONS_TABLE_NAME;

    try {
        // Find all connections for this user
        const query = new QueryCommand({
            TableName: connectionsTable,
            IndexName: "UserIdIndex",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        });

        const result = await dynamoDbDocClient.send(query);
        if (!result.Items || result.Items.length === 0) {
            return { sent: 0, failed: 0 };
        }

        // Send message to all connections in parallel
        const sendPromises = result.Items.map(async (item) => {
            const success = await sendToConnection(item.connectionId, message);
            return { success, connectionId: item.connectionId };
        });

        const results = await Promise.all(sendPromises);

        const sent = results.filter((r) => r.success).length;
        const failed = results.length - sent;

        if (failed > 0) {
            const failedConnections = results.filter((r) => !r.success).map((r) => r.connectionId);

            Logger.warn(`Failed to send to ${failed} connections`, {
                userId,
                failedConnections,
                action: message.action,
            });
        }
    } catch (error) {
        Logger.error("Error broadcasting to user", {
            error,
            userId,
            action: message.action,
        });
    }
};
