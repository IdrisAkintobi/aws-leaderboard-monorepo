import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { HIGH_SCORE_THRESHOLD, saveScore, sendHighScoreNotification } from "../../services/scoreService.js";
import { EnvironmentValidator, validateSubmitScoreRequestBody } from "../../utils/validators.js";
import { responseWithCors, handleError, dynamoDbDocClient } from "../../utils/utils.js";
import { Logger } from "../../utils/logger.js";
import type { UserInfo } from "../../services/scoreService.js";
import type { AuthorizerContext } from "../../types/auth.js";
import type { APIGatewayProxyHandler } from "aws-lambda";

export const submitScoreHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
    const action = "submit_score";

    try {
        const validation = validateSubmitScoreRequestBody(event);
        if (!validation.isValid) {
            return responseWithCors(400, { error: validation.error });
        }

        const { score } = validation.data!;

        // Authorized user from authorizer context
        const authz = (event.requestContext.authorizer || {}) as AuthorizerContext;
        const userId: string | undefined = authz.user_id || authz.principalId;
        const userName: string = authz.username || authz.preferred_username || authz.user_name || "";
        if (!userId) {
            return responseWithCors(401, { error: "Unauthorized" });
        }
        const userInfo: UserInfo = { userId, userName };

        await saveScore(userInfo, score, requestId);

        if (score > HIGH_SCORE_THRESHOLD) {
            const connectionsTable = process.env.CONNECTIONS_TABLE_NAME;
            if (connectionsTable) {
                const query = new QueryCommand({
                    TableName: connectionsTable,
                    KeyConditionExpression: "user_id = :uid",
                    ExpressionAttributeValues: {
                        ":uid": userInfo.userId,
                    },
                });
                const result = await dynamoDbDocClient.send(query);
                const items = (result.Items || []) as Array<{ connectionId: string; isConnected?: boolean }>;
                const active = items.filter((i) => i.isConnected !== false && typeof i.connectionId === "string");
                for (const c of active) {
                    try {
                        await sendHighScoreNotification(c.connectionId, userInfo.userName, score, requestId);
                    } catch (err: any) {
                        Logger.warn("Failed to notify connection", {
                            action: "notify_ws",
                            connectionId: c.connectionId,
                            requestId,
                        });
                    }
                }
            }
        }

        return responseWithCors(201, { message: "Score submitted successfully!" });
    } catch (error: any) {
        Logger.error("Score submission failed", error, {
            action,
            requestId,
        });
        return handleError(error, action, requestId);
    }
};
