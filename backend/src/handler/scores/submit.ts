import { HIGH_SCORE_THRESHOLD, saveScore, sendHighScoreNotification } from "../../services/scoreService.js";
import { EnvironmentValidator, validateSubmitScoreRequestBody } from "../../utils/validators.js";
import { httpResponse, handleError } from "../../utils/utils.js";
import { Logger } from "../../utils/logger.js";
import type { UserInfo } from "../../services/scoreService.js";
import type { APIGatewayProxyHandler } from "aws-lambda";

export const submitScoreHandler: APIGatewayProxyHandler = async (event) => {
    EnvironmentValidator.getInstance().validate();

    const requestId = event.requestContext?.requestId ?? "unknown";
    const action = "submit_score";

    try {
        const validation = validateSubmitScoreRequestBody(event);
        if (!validation.isValid) {
            return httpResponse(400, { error: validation.error });
        }

        const { score } = validation.data!;

        // Extract user info from JWT claims (from id token)
        const jwtClaims = event.requestContext.authorizer?.jwt?.claims;
        const userId = jwtClaims.sub || jwtClaims['cognito:username'];
        const userName = jwtClaims.preferred_username || jwtClaims.name;
        
        const userInfo: UserInfo = { userId, userName };
        await saveScore(userInfo, score, requestId);

        if (score > HIGH_SCORE_THRESHOLD) {
            await sendHighScoreNotification(userId, userName, score);         
        }

        return httpResponse(201, { message: "Score submitted successfully!" });
    } catch (error: any) {
        Logger.error("Score submission failed", error, {
            action,
            requestId,
        });
        return handleError(error, action, requestId);
    }
};
