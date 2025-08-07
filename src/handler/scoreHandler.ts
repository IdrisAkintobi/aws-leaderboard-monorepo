import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { randomUUID } from "node:crypto";
import {
  cognitoClient,
  dynamoDbDocClient,
  responseWithCors,
} from "../utils/utils.js";

const apiGwManagementApiClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_API_ENDPOINT!,
});

export const submitScoreHandler: APIGatewayProxyHandler = async (event) => {
  const { score } = JSON.parse(event.body || "{}");
  const authHeader = event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return responseWithCors(400, {
      error: "Authorization header must be in the format: Bearer <token>",
    });
  }

  const accessToken = authHeader.split(" ")[1];

  if (typeof score !== "number" || isNaN(score) || score < 0) {
    return responseWithCors(400, {
      error: "A valid, non-negative score is required.",
    });
  }

  try {
    const userResponse = await cognitoClient.send(
      new GetUserCommand({ AccessToken: accessToken })
    );
    const userId = userResponse.UserAttributes?.find(
      (attr) => attr.Name === "sub"
    )?.Value;
    const userName = userResponse.UserAttributes?.find(
      (attr) => attr.Name === "preferred_username"
    )?.Value;

    if (!userId || !userName) {
      return responseWithCors(401, {
        error: "Could not retrieve user information from access token.",
      });
    }

    const newScoreId = randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);

    const putCommand = new PutCommand({
      TableName: process.env.LEADERBOARD_TABLE_NAME,
      Item: {
        id: newScoreId,
        user_id: userId,
        user_name: userName,
        score: score,
        timestamp: timestamp,
        leaderboard_partition: "leaderboard",
      },
    });

    await dynamoDbDocClient.send(putCommand);

    if (score > 1000) {
      const connectionId = event.requestContext.connectionId || "test-id";
      if (connectionId) {
        const websocketMessage = JSON.stringify({
          message: "realtime-update",
          data: {
            user_name: userName,
            score: score,
            notification: "Congratulations! Your score is over 1000!",
          },
        });

        const postToConnectionCommand = new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: websocketMessage,
        });

        await apiGwManagementApiClient.send(postToConnectionCommand);
      }
    }

    return responseWithCors(201, { message: "Score submitted successfully!" });
  } catch (error: any) {
    return responseWithCors(500, { error: error.message });
  }
};

export const getLeaderboardHandlerIndexed: APIGatewayProxyHandler = async (
  event
) => {
  const queryCommand = new QueryCommand({
    TableName: process.env.LEADERBOARD_TABLE_NAME,
    IndexName: "ScoreIndex",
    KeyConditionExpression: "leaderboard_partition = :partition",
    ExpressionAttributeValues: {
      ":partition": "leaderboard",
    },
    ScanIndexForward: false,
    Limit: 1,
  });

  try {
    const data = await dynamoDbDocClient.send(queryCommand);
    const topScore = data.Items && data.Items.length > 0 ? data.Items[0] : null;

    return responseWithCors(200, { topScore });
  } catch (error: any) {
    return responseWithCors(500, { error: error.message });
  }
};

export const getLeaderboardHandler: APIGatewayProxyHandler = async (event) => {
  const scanCommand = new ScanCommand({
    TableName: process.env.LEADERBOARD_TABLE_NAME,
    FilterExpression: "leaderboard_partition = :partition",
    ExpressionAttributeValues: {
      ":partition": "leaderboard",
    },
  });

  try {
    const data = await dynamoDbDocClient.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ topScore: null }) };
    }

    // Sort items by score in descending order (assuming 'score' is the field)
    const sortedItems = data.Items.sort((a, b) => {
      return (b.score || 0) - (a.score || 0); // Replace 'score' with actual attribute name if different
    });

    const topScore = sortedItems[0];

    return responseWithCors(200, { topScore });
  } catch (error: any) {
    return responseWithCors(500, { error: error.message });
  }
};
