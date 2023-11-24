import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export async function getEnddedAuctions(event, context) {
  let now = new Date();
  const input = {
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": {
        S: "OPEN",
      },
      ":now": {
        S: now.toISOString(),
      },
    },
    KeyConditionExpression: "#status = :status AND endingAt <= :now",
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
  };

  const command = new QueryCommand(input);
  const response = await client.send(command);
  return response.Items;
}
