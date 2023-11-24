import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getEnddedAuctions } from "../lib/getEndedAuctions";
import { closeAuction } from "../lib/closeAuction";
import createHttpError from "http-errors";

async function processAuctions(event, context) {
  try {
    const auctions = await getEnddedAuctions();
    const closePromises = auctions.map((auction) => closeAuction(auction));
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
}
export const handler = processAuctions;
