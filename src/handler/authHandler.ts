import type { APIGatewayProxyHandler } from "aws-lambda";

import { ConfirmSignUpCommand, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

import { cognitoClient, computeSecretHash, handleError, responseWithCors } from "../utils/utils.js";
import {
    EnvironmentValidator,
    validateLoginRequestBody,
    validateRegisterRequestBody,
    validateVerifyRequestBody,
} from "../utils/validators.js";

export const loginHandler: APIGatewayProxyHandler = async (event) => {
    // Validate environment variables
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext.requestId;
    const action = "login";

    const validation = validateLoginRequestBody(event);
    if (!validation.isValid) {
        return responseWithCors(400, { error: validation.error });
    }

    const { email, password } = validation.data!;

    try {
        const secretHash = await computeSecretHash(email);

        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_APP_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: secretHash,
            },
        });

        const response = await cognitoClient.send(command);
        return responseWithCors(200, response.AuthenticationResult);
    } catch (error: any) {
        return handleError(error, action, requestId);
    }
};

export const registerHandler: APIGatewayProxyHandler = async (event) => {
    // Validate environment variables
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext.requestId;
    const action = "register";

    const validation = validateRegisterRequestBody(event);
    if (!validation.isValid) {
        return responseWithCors(400, { error: validation.error });
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
        return responseWithCors(201, {
            message: "User registered successfully. Please confirm your email.",
        });
    } catch (error: any) {
        return handleError(error, action, requestId);
    }
};

export const verifyHandler: APIGatewayProxyHandler = async (event) => {
    // Validate environment variables
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext.requestId;
    const action = "verify";

    const validation = validateVerifyRequestBody(event);
    if (!validation.isValid) {
        return responseWithCors(400, { error: validation.error });
    }

    const { email, code } = validation.data!;

    try {
        const secretHash = await computeSecretHash(email);

        const command = new ConfirmSignUpCommand({
            ClientId: process.env.COGNITO_APP_CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            SecretHash: secretHash,
        });

        await cognitoClient.send(command);
        return responseWithCors(200, { message: "Email confirmed successfully." });
    } catch (error: any) {
        return handleError(error, action, requestId);
    }
};
