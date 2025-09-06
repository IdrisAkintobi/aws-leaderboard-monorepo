import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { MAX_SCORE, SCORE_PAD_WIDTH, TIMESTAMP_PAD_WIDTH } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";
import { apiGwManagementApiClient, dynamoDbDocClient } from "../utils/utils.js";

export interface UserInfo {
    userId: string;
    userName: string;
}

export interface ScoreItem {
    id: string;
    user_id: string;
    user_name: string;
    score: number;
    timestamp: number;
    leaderboard_partition?: string;
    leaderboard_rank_key?: string;
}

export const LEADERBOARD_PARTITION = "leaderboard";
export const HIGH_SCORE_THRESHOLD = 1000;

export const saveScore = async (userInfo: UserInfo, score: number, requestId: string): Promise<void> => {
    try {
        // Build optional leaderboard rank key when score qualifies
        // We want highest score first and, among ties, earliest timestamp first.
        // Construct a composite key that sorts ASC: invertedScore + '#' + timestamp
        const ts = Math.floor(Date.now() / 1000);
        const boundedScore = Math.max(0, Math.min(MAX_SCORE, Math.trunc(score)));
        const invertedScore = String(MAX_SCORE - boundedScore).padStart(SCORE_PAD_WIDTH, "0");
        const tsPadded = String(ts).padStart(TIMESTAMP_PAD_WIDTH, "0");
        const rankKey = `${invertedScore}#${tsPadded}`;

        const scoreItem: ScoreItem = {
            id: randomUUID(),
            user_id: userInfo.userId,
            user_name: userInfo.userName,
            score,
            timestamp: ts,
            ...(score >= HIGH_SCORE_THRESHOLD
                ? { leaderboard_partition: LEADERBOARD_PARTITION, leaderboard_rank_key: rankKey }
                : {}),
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

export const sendHighScoreNotification = async (
    connectionId: string,
    userName: string,
    score: number,
    requestId: string,
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
