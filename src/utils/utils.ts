import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createHmac } from "node:crypto";

// Cache for the client secret
let cachedClientSecret = process.env.COGNITO_APP_CLIENT_SECRET;

const dynamoDbClient = new DynamoDBClient({});
export const cognitoClient = new CognitoIdentityProviderClient({});
export const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const getCognitoAppClientSecret = async () => {
  if (cachedClientSecret) {
    return cachedClientSecret;
  }

  try {
    const command = new DescribeUserPoolClientCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
    });

    const response = await cognitoClient.send(command);
    if (response.UserPoolClient && response.UserPoolClient.ClientSecret) {
      cachedClientSecret = response.UserPoolClient.ClientSecret;
      return cachedClientSecret;
    }
    return null; // Explicitly return null if secret is not found
  } catch (error) {
    console.error("Failed to get client secret:", error);
    return null; // Return null on error as well
  }
};

export const computeSecretHash = async (username: string): Promise<string> => {
  const clientSecret = await getCognitoAppClientSecret();
  if (!clientSecret) {
    throw new Error("Cognito App Client Secret not available.");
  }
  return createHmac("sha256", clientSecret)
    .update(username + process.env.COGNITO_APP_CLIENT_ID!)
    .digest("base64");
};
