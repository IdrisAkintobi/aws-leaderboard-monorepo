import { MIN_SCORE, MAX_SCORE } from "./constants.js";
import { Logger } from "./logger.js";

import type { APIGatewayProxyEvent } from "aws-lambda";

// Validation result interface
interface ValidationResult<T> {
    isValid: boolean;
    data?: T;
    error?: string;
}

// constants are shared via constants.ts

// Environment variable validator
export class EnvironmentValidator {
    private static instance: EnvironmentValidator;
    private readonly requiredVariables: string[];
    private constructor() {
        this.requiredVariables = [
            "COGNITO_APP_CLIENT_ID",
            "LEADERBOARD_TABLE_NAME",
            "ALLOWED_ORIGIN",
            "WEBSOCKET_API_ENDPOINT",
        ];
    }

    public static getInstance(): EnvironmentValidator {
        if (!EnvironmentValidator.instance) {
            EnvironmentValidator.instance = new EnvironmentValidator();
        }
        return EnvironmentValidator.instance;
    }

    public validate(requiredEnvVar = this.requiredVariables): void {
        const missingVariables = requiredEnvVar.filter((variable) => !process.env[variable]);

        if (missingVariables.length > 0) {
            const message = "Missing required environment variables";
            Logger.error(message, new Error(message), {
                action: "validate_environment_variables",
                missingVariables,
            });
            throw new Error(`Internal Server Error: ${message}`);
        }
    }
}

// Request validators
const parseBody = (event: APIGatewayProxyEvent) => {
    try {
        if (!event.body) return {};
        // Some local tools or proxies may pass an already-parsed object
        if (typeof (event as any).body === "object") {
            return (event as any).body ?? {};
        }
        const str = String(event.body);
        const raw = event.isBase64Encoded ? Buffer.from(str, "base64").toString("utf-8") : str.trim();
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e: any) {
        Logger.warn("Failed to parse request body as JSON", { action: "parse_body", error: e?.message });
        return {};
    }
};

export const validateLoginRequestBody = (
    event: APIGatewayProxyEvent,
): ValidationResult<{ email: any; password: any }> => {
    const body = parseBody(event);
    const { email, password } = body;

    if (!email || !password) {
        return { isValid: false, error: "Email and password are required." };
    }

    return { isValid: true, data: { email, password } };
};

export const validateRegisterRequestBody = (
    event: APIGatewayProxyEvent,
): ValidationResult<{
    email: any;
    password: any;
    username: any;
    name: any;
}> => {
    const body = parseBody(event);
    const { email, password, username, name } = body;

    if (!email || !password || !username || !name) {
        return { isValid: false, error: "All fields are required." };
    }

    return { isValid: true, data: { email, password, username, name } };
};

export const validateVerifyRequestBody = (event: APIGatewayProxyEvent): ValidationResult<{ email: any; code: any }> => {
    const body = parseBody(event);
    const { email, code } = body;

    if (!email || !code) {
        return { isValid: false, error: "Email and code are required." };
    }

    return { isValid: true, data: { email, code } };
};

export const validateSubmitScoreRequestBody = (event: APIGatewayProxyEvent): ValidationResult<{ score: number }> => {
    const body = parseBody(event);
    const { score } = body;

    if (score === undefined || score === null) {
        return { isValid: false, error: "Score field is required" };
    }

    if (typeof score !== "number" || isNaN(score)) {
        return { isValid: false, error: "Score must be a valid number" };
    }

    if (score < MIN_SCORE || score > MAX_SCORE) {
        return {
            isValid: false,
            error: `Score must be between ${MIN_SCORE} and ${MAX_SCORE}`,
        };
    }

    return { isValid: true, data: { score } };
};

// Auth token extraction is no longer needed; protected routes use a Lambda Authorizer.
