import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

import { cognitoClient, computeSecretHash, handleError, httpResponse } from "../../utils/utils.js";
import { EnvironmentValidator, validateLoginRequestBody } from "../../utils/validators.js";

import type { APIGatewayProxyHandler } from "aws-lambda";

export const loginHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
    const action = "login";

    const validation = validateLoginRequestBody(event);
    if (!validation.isValid) {
        return httpResponse(400, { error: validation.error });
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
        return httpResponse(200, response.AuthenticationResult as Record<string, unknown>);
    } catch (error: any) {
        return handleError(error, action, requestId);
    }
};
