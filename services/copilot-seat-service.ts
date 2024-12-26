import { format } from "date-fns";
import { 
  formatResponseError, 
  unknownResponseError 
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ensureGitHubEnvConfig } from "./env-service";
import { stringIsNullOrEmpty } from "../utils/helpers";
import { 
  CopilotSeats,
  ICopilotSeatsData,
  ICopilotSeatManagementData 
} from "@/types/CopilotSeats";
import { mongoClient } from "./mongo-db-service";

export interface IFilter {
  date?: Date;
  enterprise: string;
  organization: string;
  team: string;
}

export const getCopilotSeats = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotSeatsData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise;
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    return getCopilotSeatsFromDatabase(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotSeatsData >> => {
  await mongoClient();

  let date = filter.date ? format(filter.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  try {
    const query: any = { date };
    
    if (filter.enterprise) {
      query.enterprise = filter.enterprise;
    }
    if (filter.organization) {
      query.organization = filter.organization;
    }
    if (filter.team) {
      query.team = filter.team;
    }

    const result = await CopilotSeats.findOne(query).lean();

    return {
      status: "OK",
      response: (result as unknown as ICopilotSeatsData) || {
        id: '',
        date: date,
        last_update: '',
        enterprise: '',
        organization: '',
        seats: [],
        total_seats: 0
      } as unknown as ICopilotSeatsData,
    };
  } catch (error) {
    return unknownResponseError(error);
  }
};

export const getCopilotSeatsManagement = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotSeatManagementData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise;
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    return getCopilotSeatsManagementFromAPI(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsManagementFromAPI = async (
  filter: IFilter
): Promise<ServerActionResponse<ICopilotSeatManagementData>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  let { enterprise, organization, token, version } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise": {
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise;
        }
        const today = new Date();
        const enterpriseSeats: ICopilotSeatsData = {
          enterprise: filter.enterprise,
          seats: [],
          total_seats: 0,
          last_update: format(today, "yyyy-MM-ddTHH:mm:ss"),
          date: format(today, "yyyy-MM-dd"),
          id: `${format(today, "yyyy-MM-dd")}-ENT-${filter.enterprise}`,
          organization: null,
        } as unknown as ICopilotSeatsData;

        let url = `https://api.github.com/enterprises/${filter.enterprise}/copilot/billing/seats`;
        do {
          const enterpriseResponse = await fetch(url, {
            cache: "no-store",
            headers: {
              Accept: `application/vnd.github+json`,
              Authorization: `Bearer ${token}`,
              "X-GitHub-Api-Version": version,
            },
          });

          if (!enterpriseResponse.ok) {
            return formatResponseError(enterprise, enterpriseResponse);
          }

          const enterpriseData = await enterpriseResponse.json();
          enterpriseSeats.seats.push(...enterpriseData.seats);
          enterpriseSeats.total_seats = enterpriseData.total_seats;

          const linkHeader = enterpriseResponse.headers.get("Link");
          url = getNextUrlFromLinkHeader(linkHeader) || "";
        } while (!stringIsNullOrEmpty(url));


        const activeSeats = enterpriseSeats.seats.filter((seat) => {
          const lastActivityDate = new Date(seat.last_activity_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActivityDate >= thirtyDaysAgo;
        });

        const seatManagementData: ICopilotSeatManagementData = {
          enterprise: enterpriseSeats.enterprise,
          organization: enterpriseSeats.organization,
          date: enterpriseSeats.date,
          id: enterpriseSeats.id,
          last_update: enterpriseSeats.last_update,
          total_seats: enterpriseSeats.total_seats,
          seats: {
            seat_breakdown: {
              total: enterpriseSeats.seats.length,
              active_this_cycle: activeSeats.length,
              inactive_this_cycle: enterpriseSeats.seats.length - activeSeats.length,
              added_this_cycle: 0,
              pending_invitation: 0,
              pending_cancellation: 0,
            },
            allSeats: enterpriseSeats.seats,
            seat_management_setting: "",
            public_code_suggestions: "",
            ide_chat: "",
            platform_chat: "",
            cli: "",
            plan_type: "",
          },
        } as ICopilotSeatManagementData;

        return {
          status: "OK",
          response: seatManagementData,
        };
      }

      default: {
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        const response = await fetch(
          `https://api.github.com/orgs/${filter.organization}/copilot/billing`,
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
          return formatResponseError(filter.organization, response);
        }

        const seats = await response.json();
        const today = new Date();
        const data: ICopilotSeatManagementData = {
          id: `${format(today, "yyyy-MM-dd")}-ORG-${filter.organization}`,
          date: format(today, "yyyy-MM-dd"),
          last_update: format(today, "yyyy-MM-ddTHH:mm:ss"),
          total_seats: seats.total_seats,
          seats: seats,
          enterprise: filter.enterprise,
          organization: filter.organization,
        } as ICopilotSeatManagementData;

        return {
          status: "OK",
          response: data,
        };
      }
    }
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getNextUrlFromLinkHeader = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;
  
  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === 'next') {
      return match[1];
    }
  }
  return null;
};
