import { Logger } from "../../utils/logger.js";
import { httpResponse } from "../../utils/utils.js";
import { sendToConnection } from "../../utils/ws.js";

import type { APIGatewayProxyEvent } from "aws-lambda";

export const defaultHandler = async (event: APIGatewayProxyEvent) => {
    const connectionId = event.requestContext.connectionId!;

    try {
        const body = event.body ? JSON.parse(event.body) : null;
        Logger.info("Default WebSocket handler called", {
            action: 'ws_default',
            connectionId,
            body
        });

        // Handle echo action
        if (body?.action === 'echo') {
            await sendToConnection(connectionId, {
                action: 'echo',
                data: {
                    ...body.data,
                    timestamp: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        Logger.error("Error in default WebSocket handler", {
            error: error instanceof Error ? error.message : "Unknown error",
            requestId: event.requestContext?.requestId,
        });
    }
};
