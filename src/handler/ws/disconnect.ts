import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "../../utils/logger.js";
import { dynamoDbDocClient } from "../../utils/utils.js";
import type { APIGatewayProxyHandler } from "aws-lambda";

// WebSocket $disconnect handler
export const disconnectHandler: APIGatewayProxyHandler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;
        const connectionsTable = process.env.WS_CONNECTIONS_TABLE_NAME;
        
        try {
            // Delete the connection record directly using connectionId as the partition key
            await dynamoDbDocClient.send(new DeleteCommand({
                TableName: connectionsTable,
                Key: {
                    connectionId: connectionId
                },
                ReturnValues: 'NONE'
            }));
        } catch (error) {
            Logger.warn("Failed to delete connection record", { 
                error,
                connectionId,
                action: "ws_disconnect" 
            });
        }

        return { statusCode: 200, body: "Disconnected" };
    } catch (error) {
        Logger.error("$disconnect failed", error, { action: "ws_disconnect" });
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
