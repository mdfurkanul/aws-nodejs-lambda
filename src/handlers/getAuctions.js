import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import createHttpError from "http-errors";
import { getMiddleware } from "../lib/commonMiddleware";

const client = new DynamoDBClient({});

async function getAuctions(event, context) {
  let auctions;
  try {
    const command = new ScanCommand({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    });
    const response = await client.send(command);
    auctions = response.Items;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ auctions }),
  };
}

export const handler = getMiddleware(getAuctions);
