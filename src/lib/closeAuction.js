import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export async function closeAuction(auction) {
  let now = new Date();
  const input = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: {
      id: {
        S: auction.id.S,
      },
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": {
        S: "CLOSED",
      },
    },
    UpdateExpression: "SET #status = :status",
    ReturnValues: "ALL_NEW",
  };

  const command = new UpdateItemCommand(input);
  const response = await client.send(command);
  return response;
}
