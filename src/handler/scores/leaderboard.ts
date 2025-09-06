import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { LEADERBOARD_PARTITION } from "../../services/scoreService.js";
import { responseWithCors, dynamoDbDocClient } from "../../utils/utils.js";
import { EnvironmentValidator } from "../../utils/validators.js";

import type { APIGatewayProxyHandler } from "aws-lambda";

export const getLeaderboardHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
    const action = "get_leaderboard";

    try {
        const queryCommand = new QueryCommand({
            TableName: process.env.LEADERBOARD_TABLE_NAME,
            IndexName: "LeaderboardIndex",
            KeyConditionExpression: "leaderboard_partition = :partition",
            ExpressionAttributeValues: {
                ":partition": LEADERBOARD_PARTITION,
            },
            ScanIndexForward: true,
            Limit: 1,
        });

        const data = await dynamoDbDocClient.send(queryCommand);
        const {user_id, user_name, score} = data.Items && data.Items[0] ? data.Items[0] : {};
        return responseWithCors(200, { user_id, user_name, score });
    } catch (error: any) {
        return responseWithCors(500, { error: error.message, action, requestId });
    }
};
