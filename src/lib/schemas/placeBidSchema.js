const schema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      properties: {
        amount: {
          type: "number",
        },
      },
      required: ["amount"],
    },
  },
};
export default schema;
