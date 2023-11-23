import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import createHttpError from "http-errors";
import { getMiddleware } from "../lib/commonMiddleware";

const client = new DynamoDBClient({});

export async function getAuctionByID(id) {
  let auction;
  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: { S: id } },
  };
  try {
    const command = new GetItemCommand(input);
    const response = await client.send(command);
    auction = response.Item;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID ${id} not found!`);
  }
  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionByID(id);
  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
}

export const handler = getMiddleware(getAuction);
