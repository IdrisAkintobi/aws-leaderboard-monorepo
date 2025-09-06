import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

import { cognitoClient, computeSecretHash, handleError, responseWithCors } from "../../utils/utils.js";
import { EnvironmentValidator, validateVerifyRequestBody } from "../../utils/validators.js";

import type { APIGatewayProxyHandler } from "aws-lambda";

export const verifyHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
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
