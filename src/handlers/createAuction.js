import { v4 as uuid } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import createHttpError from "http-errors";
import validatorMiddleware from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { postMiddleWare } from "../lib/commonMiddleware";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";

const client = new DynamoDBClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const ending_date = new Date();
  ending_date.setHours(now.getHours() + 1);
  let response;

  const auction = {
    id: {
      S: uuid(),
    },
    title: {
      S: title,
    },
    highestBid: {
      M: {
        amount: {
          N: "0",
        },
      },
    },
    status: {
      S: "OPEN",
    },
    endingAt: {
      S: ending_date.toISOString(),
    },
    createdAt: {
      S: now.toISOString(),
    },
  };

  const input = {
    Item: auction,
    TableName: process.env.AUCTIONS_TABLE_NAME,
  };

  try {
    const command = new PutItemCommand(input);
    response = await client.send(command);
    console.log(response);
  } catch (error) {
    console.log("Error", error);
    throw new createHttpError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify({ auction, response }),
  };
}

export const handler = postMiddleWare(createAuction).use(
  validatorMiddleware({
    eventSchema: transpileSchema(createAuctionSchema),
    ajvOptions: {
      strict: false,
    },
  })
);
