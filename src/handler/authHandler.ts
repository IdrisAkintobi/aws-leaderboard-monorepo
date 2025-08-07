import {
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  cognitoClient,
  computeSecretHash,
  responseWithCors,
} from "../utils/utils.js";

export const loginHandler: APIGatewayProxyHandler = async (event) => {
  const { email, password } = JSON.parse(event.body || "{}");

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email and password are required." }),
    };
  }

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

  try {
    const response = await cognitoClient.send(command);
    return responseWithCors(200, response.AuthenticationResult);
  } catch (error: any) {
    return responseWithCors(401, { error: error.message });
  }
};

export const registerHandler: APIGatewayProxyHandler = async (event) => {
  const { email, password, username, name } = JSON.parse(event.body || "{}");

  if (!email || !password || !username || !name) {
    return responseWithCors(400, { error: "All fields are required." });
  }

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

  try {
    await cognitoClient.send(command);
    return responseWithCors(201, {
      message: "User registered successfully. Please confirm your email.",
    });
  } catch (error: any) {
    return responseWithCors(500, { error: error.message });
  }
};

export const verifyHandler: APIGatewayProxyHandler = async (event) => {
  const { email, code } = JSON.parse(event.body || "{}");

  if (!email || !code) {
    return responseWithCors(400, { error: "Email and code are required." });
  }

  const secretHash = await computeSecretHash(email);

  const command = new ConfirmSignUpCommand({
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash,
  });

  try {
    await cognitoClient.send(command);
    return responseWithCors(200, { message: "Email confirmed successfully." });
  } catch (error: any) {
    return responseWithCors(500, { error: error.message });
  }
};
