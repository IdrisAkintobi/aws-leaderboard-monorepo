import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

import { cognitoClient, computeSecretHash, handleError, httpResponse } from "../../utils/utils.js";
import { EnvironmentValidator, validateRegisterRequestBody } from "../../utils/validators.js";

import type { APIGatewayProxyHandler } from "aws-lambda";

export const registerHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
    const action = "register";

    const validation = validateRegisterRequestBody(event);
    if (!validation.isValid) {
        return httpResponse(400, { error: validation.error });
    }

    const { email, password, username, name } = validation.data!;

    try {
        const secretHash = await computeSecretHash(email);
        const command = new SignUpCommand({
            ClientId: process.env.COGNITO_APP_CLIENT_ID,
            Username: email,
            Password: password,
            SecretHash: secretHash,
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "preferred_username", Value: username },
                { Name: "name", Value: name },
            ],
        });

        await cognitoClient.send(command);
        return httpResponse(201, {
            message: "User registered successfully. Please confirm your email.",
        });
    } catch (error: any) {
        return handleError(error, action, requestId);
    }
};
