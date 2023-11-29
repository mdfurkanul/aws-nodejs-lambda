import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import createHttpError from "http-errors";
import validatorMiddleware from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { getMiddleware } from "../lib/commonMiddleware";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";
const client = new DynamoDBClient({});

async function getAuctions(event, context) {
  let { status } = event.queryStringParameters;
  let auctions;
  let now = new Date();
  const input = {
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": {
        S: status,
      },
    },
    KeyConditionExpression: "#status = :status",
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
  };

  try {
    const command = new QueryCommand(input);
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

export const handler = getMiddleware(getAuctions).use(
  validatorMiddleware({
    eventSchema: transpileSchema(getAuctionsSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
