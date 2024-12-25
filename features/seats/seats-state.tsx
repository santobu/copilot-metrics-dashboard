"use client";

import { PropsWithChildren } from "react";
import { ICopilotSeatsData } from "@/types/CopilotSeats";
import { proxy, useSnapshot } from "valtio";

interface IProps extends PropsWithChildren {
  copilotSeats: ICopilotSeatsData;
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

class DashboardState {
  public filteredData: ICopilotSeatsData = {} as ICopilotSeatsData;

  private apiData: ICopilotSeatsData = {} as ICopilotSeatsData;

  public initData(data: ICopilotSeatsData): void {
    this.apiData = data;
    this.filteredData = data;
  }
}

export const dashboardStore = proxy(new DashboardState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as DashboardState;
};

export const DataProvider = ({ children, copilotSeats }: IProps) => {
  dashboardStore.initData(copilotSeats);
  return <>{children}</>;
};
