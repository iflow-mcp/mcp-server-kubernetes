import { KubernetesManager } from "../types.js";
import { execFileSync } from "child_process";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getSpawnMaxBuffer } from "../config/max-buffer.js";
import { contextParameter, namespaceParameter } from "../models/common-parameters.js";

export const kubectlScaleSchema = {
  name: "kubectl_scale",
  description: "Scale a Kubernetes deployment",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the deployment to scale",
      },
      namespace: namespaceParameter,
      replicas: {
        type: "number",
        description: "Number of replicas to scale to",
      },
      resourceType: {
        type: "string",
        description:
          "Resource type to scale (deployment, replicaset, statefulset)",
        default: "deployment",
      },
      context: contextParameter,
    },
    required: ["name", "replicas"],
  },
};

export async function kubectlScale(
  k8sManager: KubernetesManager,
  input: {
    name: string;
    namespace?: string;
    replicas: number;
    resourceType?: string;
    context?: string;
  }
) {
  try {
    const namespace = input.namespace || "default";
    const resourceType = input.resourceType || "deployment";
    const context = input.context || "";

    const command = "kubectl";
    const args = [
      "scale",
      resourceType,
      input.name,
      `--replicas=${input.replicas}`,
      `--namespace=${namespace}`,
    ];

    // Add context if provided
    if (context) {
      args.push("--context", context);
    }

    // Execute the command
    try {
      const result = execFileSync(command, args, {
        encoding: "utf8",
        maxBuffer: getSpawnMaxBuffer(),
        env: { ...process.env, KUBECONFIG: process.env.KUBECONFIG },
      });

      const response = {
        success: true,
        message: `Scaled ${resourceType} ${input.name} to ${input.replicas} replicas`,
        resourceType: resourceType,
        name: input.name,
        replicas: input.replicas,
        namespace: namespace,
        timestamp: new Date().toISOString(),
        server: "mcp-server-kubernetes"
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2)
          },
        ],
      };
    } catch (error: any) {
      // 确保错误情况下也返回正确的格式
      const errorResponse = {
        success: false,
        message: `Failed to scale ${resourceType}: ${error.message}`,
        resourceType: resourceType,
        name: input.name,
        replicas: input.replicas,
        namespace: namespace,
        timestamp: new Date().toISOString(),
        server: "mcp-server-kubernetes",
        error: error.message
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(errorResponse, null, 2)
          },
        ],
      };
    }
  } catch (error: any) {
    // 最外层错误处理，确保总是返回正确的格式
    const errorResponse = {
      success: false,
      message: error instanceof McpError ? error.message : `Failed to scale resource: ${error.message}`,
      timestamp: new Date().toISOString(),
      server: "mcp-server-kubernetes",
      error: error.message || "Unknown error"
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(errorResponse, null, 2)
        },
      ],
    };
  }
}