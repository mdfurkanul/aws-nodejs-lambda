import { v4 as uuid } from "uuid";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import createHttpError from "http-errors";
import { postMiddleWare } from "../lib/commonMiddleware";
import { getAuctionByID } from "./getAuction";

const client = new DynamoDBClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const auction = await getAuctionByID(id);
  if (auction.status.S === "CLOSED") {
    throw new createHttpError.Forbidden(`The Auction is closed!`);
  }
  if (amount <= auction.highestBid.M.amount.N) {
    throw new createHttpError.Forbidden(
      `Your bid must be higer that  ${auction.highestBid.M.amount.N}!`
    );
  }
  let updatedAuction;

  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: {
      id: {
        S: id,
      },
    },
    ExpressionAttributeNames: {
      "#highestBid": "highestBid",
      "#amount": "amount",
    },
    ExpressionAttributeValues: {
      ":amount": {
        N: `${amount}`,
      },
    },
    UpdateExpression: "SET #highestBid.#amount = :amount",
    ReturnValues: "ALL_NEW",
  };

  try {
    const command = new UpdateItemCommand(input);
    const response = await client.send(command);
    updatedAuction = response.Attributes;
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
  return {
    statusCode: 202,
    body: JSON.stringify({ updatedAuction }),
  };
}

export const handler = postMiddleWare(placeBid);
