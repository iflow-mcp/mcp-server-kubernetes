export const pingSchema = {
  name: "ping",
  description:
    "Verify that the counterpart is still responsive and the connection is alive.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export async function ping() {
  try {
    const response = {
      status: "success",
      message: "Connection is alive and responsive",
      timestamp: new Date().toISOString(),
      server: "mcp-server-kubernetes",
      version: "2.8.0"
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    // 确保即使出错也返回有效的 content
    const errorResponse = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
      server: "mcp-server-kubernetes",
      version: "2.8.0"
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(errorResponse, null, 2)
        }
      ]
    };
  }
}