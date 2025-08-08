import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { randomUUID } from "node:crypto";
import { Logger } from "../utils/logger.js";
import {
  apiGwManagementApiClient,
  cognitoClient,
  dynamoDbDocClient,
  handleError,
  responseWithCors,
} from "../utils/utils.js";
import {
  EnvironmentValidator,
  validateSubmitScoreRequestBody,
} from "../utils/validators.js";

interface UserInfo {
  userId: string;
  userName: string;
}

interface ScoreItem {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
  leaderboard_partition: string;
}

// Constants
const LEADERBOARD_PARTITION = "leaderboard";
const HIGH_SCORE_THRESHOLD = 1000;
const SCAN_LIMIT = 10_000;

// Function to get user information from Cognito
const getUserInfo = async (
  accessToken: string,
  requestId: string
): Promise<UserInfo> => {
  try {
    const userResponse = await cognitoClient.send(
      new GetUserCommand({ AccessToken: accessToken })
    );

    const attributes = userResponse.UserAttributes || [];
    const userId = attributes.find((attr) => attr.Name === "sub")?.Value;
    const userName = attributes.find(
      (attr) => attr.Name === "preferred_username"
    )?.Value;

    if (!userId || !userName) {
      throw new Error("Could not retrieve user information from access token.");
    }
    return { userId, userName };
  } catch (error: any) {
    Logger.error("Failed to get user info", error, {
      action: "get_user_info",
      requestId,
    });

    // Handle expired token
    if (
      error.name === "NotAuthorizedException" ||
      error.message?.includes("Access Token has expired") ||
      error.message?.includes("token is expired")
    ) {
      const invalidTokenError = new Error(
        "Access token has expired. Please log in again."
      );
      invalidTokenError.name = "InvalidToken";
      throw invalidTokenError;
    }

    // Handle other authentication-related errors
    if (
      error.name === "UserNotConfirmedException" ||
      error.name === "UserNotFoundException" ||
      error.name === "InvalidParameterException"
    ) {
      const authError = new Error(
        `Invalid or unauthorized access token: ${error.name}`
      );
      authError.name = "AuthenticationError";
      throw authError;
    }

    throw error;
  }
};

const saveScore = async (
  userInfo: UserInfo,
  score: number,
  requestId: string
): Promise<void> => {
  try {
    const scoreItem: ScoreItem = {
      id: randomUUID(),
      user_id: userInfo.userId,
      user_name: userInfo.userName,
      score,
      timestamp: Math.floor(Date.now() / 1000),
      leaderboard_partition: LEADERBOARD_PARTITION,
    };

    const putCommand = new PutCommand({
      TableName: process.env.LEADERBOARD_TABLE_NAME,
      Item: scoreItem,
    });

    await dynamoDbDocClient.send(putCommand);
  } catch (error) {
    Logger.error("Failed to save score", error, {
      action: "save_score",
      requestId,
      userId: userInfo.userId,
      score,
    });
    throw error;
  }
};

const sendHighScoreNotification = async (
  connectionId: string,
  userName: string,
  score: number,
  requestId: string
): Promise<void> => {
  try {
    const websocketMessage = JSON.stringify({
      message: "realtime-update",
      data: {
        user_name: userName,
        score,
        notification: `Congratulations! Your score of ${score} is over ${HIGH_SCORE_THRESHOLD}!`,
      },
    });

    const postToConnectionCommand = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: websocketMessage,
    });

    await apiGwManagementApiClient.send(postToConnectionCommand);
  } catch (error) {
    Logger.error("Failed to send high score notification", error, {
      action: "send_notification",
      requestId,
      userName,
      connectionId,
    });
  }
};

// Main handlers
export const submitScoreHandler: APIGatewayProxyHandler = async (event) => {
  // Validate environment variables
  EnvironmentValidator.getInstance().validate();

  const requestId = event.requestContext.requestId;
  const action = "submit_score";

  try {
    // Validate request
    const validation = validateSubmitScoreRequestBody(event);
    if (!validation.isValid) {
      return responseWithCors(400, { error: validation.error });
    }

    const { score, token } = validation.data!;

    // Get user information
    const userInfo = await getUserInfo(token, requestId);

    // Save score to database
    await saveScore(userInfo, score, requestId);

    // Send high score notification if applicable
    if (score > HIGH_SCORE_THRESHOLD) {
      const connectionId = event.headers["x-ws-connection-id"];
      if (connectionId) {
        await sendHighScoreNotification(
          connectionId,
          userInfo.userName,
          score,
          requestId
        );
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

export const getLeaderboardHandler: APIGatewayProxyHandler = async (event) => {
  // Validate environment variables
  EnvironmentValidator.getInstance().validate();

  const requestId = event.requestContext.requestId;
  const action = "get_leaderboard";

  try {
    const scanCommand = new ScanCommand({
      TableName: process.env.LEADERBOARD_TABLE_NAME,
      FilterExpression: "leaderboard_partition = :partition",
      ExpressionAttributeValues: {
        ":partition": LEADERBOARD_PARTITION,
      },
      Limit: SCAN_LIMIT,
    });

    const data = await dynamoDbDocClient.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      return responseWithCors(200, { topScore: {} });
    }

    // Sort items by score in descending order and limit
    const topScores = (data.Items as ScoreItem[]).sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );
    const topScore = topScores.length > 0 ? topScores[0] : {};

    return responseWithCors(200, { topScore });
  } catch (error: any) {
    Logger.error("Leaderboard request failed", error, {
      action,
      requestId,
    });
    return responseWithCors(500, { error: error.message });
  }
};
