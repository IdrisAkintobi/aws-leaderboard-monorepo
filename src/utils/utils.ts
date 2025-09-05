import { createHmac } from "node:crypto";
import type { APIGatewayProxyResult } from "aws-lambda";

import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import {
    CognitoIdentityProviderClient,
    DescribeUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { Logger } from "./logger.js";

// Cache for the client secret
let cachedClientSecret = process.env.COGNITO_APP_CLIENT_SECRET;

const dynamoDbClient = new DynamoDBClient();
export const cognitoClient = new CognitoIdentityProviderClient();
export const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
export const apiGwManagementApiClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKET_API_ENDPOINT!,
});

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

export function responseWithCors(statusCode: number, body: unknown): APIGatewayProxyResult {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN!,
            "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify(body),
    };
}

export const handleError = (error: any, action: string, requestId?: string) => {
    const context = { action, requestId };

    // Handle expired token
    if (
        error.name === "NotAuthorizedException" ||
        error.message?.includes("Access Token has expired") ||
        error.message?.includes("token is expired")
    ) {
        Logger.warn("Invalid token error", context);
        return responseWithCors(401, { error: error.message });
    }

    // Handle other authentication-related errors
    if (
        error.name === "UserNotConfirmedException" ||
        error.name === "UserNotFoundException" ||
        error.name === "InvalidParameterException"
    ) {
        Logger.warn("Authentication error", context);
        return responseWithCors(401, { error: error.message });
    }

    if (error.name === "UserNotFoundException" || error.name === "NotAuthorizedException") {
        return responseWithCors(401, { error: "Invalid credentials." });
    }

    if (error.name === "UsernameExistsException") {
        return responseWithCors(409, {
            error: "User with this email already exists.",
        });
    }

    if (error.name === "CodeMismatchException") {
        return responseWithCors(400, { error: "Invalid verification code." });
    }
    Logger.error("Unhandled error", error, context);
    return responseWithCors(500, { error: error.message });
};
