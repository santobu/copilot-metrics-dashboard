import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { format } from "date-fns";
import { ensureGitHubEnvConfig } from "./env-service";
import { applyTimeFrameLabel } from "./helper";
import { sampleData } from "./sample-data";
import { mongoClient, mongoConfiguration } from "./mongo-db-service";
import { CopilotUsage, ICopilotUsage } from "@/types/CopilotUsage";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
}

export const getCopilotMetrics = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotUsage[]>> => {
  try {
    const isMongoConfig = mongoConfiguration();
    switch(process.env.GITHUB_API_SCOPE) {
      // If we have the required environment variables, we can use the enterprise API endpoint
      case "enterprise":
        // If we have the required environment variables, we can use the database
        if (isMongoConfig) {
          return getCopilotMetricsForEnterpriseFromDatabase(filter);
        }
        return getCopilotMetricsForEnterpriseFromApi();
      break;
      
      // As default option, we can use the organization API endpoint
      default:
        // If we have the required environment variables, we can use the database
        if (isMongoConfig) {
          return getCopilotMetricsForOrgsFromDatabase(filter);
        }
        return getCopilotMetricsForOrgsFromApi();
      break;
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: "" + e }],
    };
  }
};

export const getCopilotMetricsForOrgsFromApi = async (): Promise<
  ServerActionResponse<ICopilotUsage[]>
> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { organization, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${organization}/copilot/usage`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(organization, response);
    }

    const data = await response.json();
    const dataWithTimeFrame = applyTimeFrameLabel(data);
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getRawCopilotMetricsForEnterpriseFromApi = async (): Promise<
  ServerActionResponse<any>
> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/enterprises/${enterprise}/copilot/usage`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(enterprise, response);
    }

    const data = await response.json();
    return {
      status: "OK",
      response: data,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsForEnterpriseFromApi = async (): Promise<
  ServerActionResponse<ICopilotUsage[]>
> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/enterprises/${enterprise}/copilot/usage`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(enterprise, response);
    }

    const data = await response.json();
    const dataWithTimeFrame = applyTimeFrameLabel(data);
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsForOrgsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotUsage[]>> => {
  await mongoClient();
  
  const maximumDays = 31;
  let start: string;
  let end: string;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);
    
    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  try {
    const resources = await CopilotUsage.find({
      day: {
        $gte: start,
        $lte: end
      }
    }).lean();

    const dataWithTimeFrame = applyTimeFrameLabel(resources);
    
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (error) {
    console.error('Error fetching copilot metrics:', error);
    return {
      status: "ERROR",
      errors: [{ message: "Failed to fetch copilot metrics" }],
    };
  }
};

export const getCopilotMetricsForEnterpriseFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotUsage[]>> => {
  await mongoClient();
  
  const maximumDays = 31;
  let start: string;
  let end: string;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);
    
    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  try {
    const resources = await CopilotUsage.find({
      day: {
        $gte: start,
        $lte: end
      }
    }).lean();

    const dataWithTimeFrame = applyTimeFrameLabel(resources);
    
    return {
      status: "OK",
      response: dataWithTimeFrame,
    };
  } catch (error) {
    console.error('Error fetching enterprise copilot metrics:', error);
    return {
      status: "ERROR",
      errors: [{ message: "Failed to fetch enterprise copilot metrics" }],
    };
  }
};

export const _getCopilotMetrics = (): Promise<ICopilotUsage[]> => {
  const promise = new Promise<ICopilotUsage[]>((resolve) => {
    setTimeout(() => {
      const weekly = applyTimeFrameLabel(sampleData);
      resolve(weekly);
    }, 1000);
  });

  return promise;
};
