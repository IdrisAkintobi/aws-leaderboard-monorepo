import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { randomUUID } from "node:crypto";

const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
const cognitoClient = new CognitoIdentityProviderClient({});
const apiGwManagementApiClient = new ApiGatewayManagementApiClient(
  process.env.WEBSOCKET_API_ENDPOINT
    ? { endpoint: process.env.WEBSOCKET_API_ENDPOINT }
    : {}
);

export const submitScoreHandler: APIGatewayProxyHandler = async (event) => {
  const { score } = JSON.parse(event.body || "{}");
  const authHeader = event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Authorization header must be in the format: Bearer <token>",
      }),
    };
  }

  const accessToken = authHeader.split(" ")[1];

  if (typeof score !== "number" || isNaN(score) || score < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "A valid, non-negative score is required.",
      }),
    };
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
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Could not retrieve user information from access token.",
        }),
      };
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

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Score submitted successfully!" }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
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

    return { statusCode: 200, body: JSON.stringify({ topScore }) };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
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

    return { statusCode: 200, body: JSON.stringify({ topScore }) };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
