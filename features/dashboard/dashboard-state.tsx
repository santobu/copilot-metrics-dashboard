"use client";

import { PropsWithChildren } from "react";
import { IBreakdown, ICopilotUsage } from "@/types/CopilotUsage";
import { formatDate } from "@/utils/helpers";

import { proxy, useSnapshot } from "valtio";

import { groupByTimeFrame } from "@/utils/data-mapper";
import { SeatsManagement } from "@/types/CopilotSeats";

interface IProps extends PropsWithChildren {
  copilotUsages: ICopilotUsage[];
  seatManagement: SeatsManagement;
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

export type TimeFrame = "daily" | "weekly" | "monthly";

class DashboardState {
  public filteredData: ICopilotUsage[] = [];
  public languages: DropdownFilterItem[] = [];
  public editors: DropdownFilterItem[] = [];
  public timeFrame: TimeFrame = "daily";

  public seatManagement: SeatsManagement = {} as SeatsManagement;

  private apiData: ICopilotUsage[] = [];

  public initData(data: any[], seatManagement: SeatsManagement): void {
    this.apiData = [...data];
    this.filteredData = [...data];
    this.onTimeFrameChange(this.timeFrame);
    this.languages = this.extractUniqueLanguages();
    this.editors = this.extractUniqueEditors();
    this.seatManagement = seatManagement;
  }

  public filterLanguage(language: string): void {
    const item = this.languages.find((l) => l.value === language);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public filterEditor(editor: string): void {
    const item = this.editors.find((l) => l.value === editor);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public resetAllFilters(): void {
    this.languages.forEach((item) => (item.isSelected = false));
    this.editors.forEach((item) => (item.isSelected = false));
    this.applyFilters();
  }

  public onTimeFrameChange(timeFrame: TimeFrame): void {
    this.timeFrame = timeFrame;
    this.applyFilters();
  }

  private applyFilters(): void {
    const data = this.aggregatedDataByTimeFrame();

    const selectedLanguages = this.languages.filter((item) => item.isSelected);
    const selectedEditors = this.editors.filter((item) => item.isSelected);

    if (selectedLanguages.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: IBreakdown) =>
          selectedLanguages.some(
            (selectedLanguage) => selectedLanguage.value === breakdown.language
          )
        );
        item.breakdown = filtered;
      });
    }

    if (selectedEditors.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: IBreakdown) =>
          selectedEditors.some((editor) => editor.value === breakdown.editor)
        );
        item.breakdown = filtered;
      });
    }

    const filtered = data.filter((item) => item.breakdown.length > 0);
    this.filteredData = filtered as any;
  }

  private extractUniqueLanguages(): DropdownFilterItem[] {
    const languages: DropdownFilterItem[] = [];

    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = languages.findIndex(
          (language) => language.value === breakdown.language
        );

        if (index === -1) {
          languages.push({ value: breakdown.language, isSelected: false });
        }
      });
    });

    return languages;
  }

  private extractUniqueEditors(): DropdownFilterItem[] {
    const editors: DropdownFilterItem[] = [];
    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = editors.findIndex(
          (editor) => editor.value === breakdown.editor
        );

        if (index === -1) {
          editors.push({ value: breakdown.editor, isSelected: false });
        }
      });
    });

    return editors;
  }

  private aggregatedDataByTimeFrame() {
    const items = JSON.parse(
      JSON.stringify(this.apiData)
    ) as Array<ICopilotUsage>;

    if (this.timeFrame === "daily") {
      items.forEach((item) => {
        item.time_frame_display = formatDate(item.day);
      });
      return items;
    }

    const groupedByTimeFrame = items.reduce((acc, item) => {
      const timeFrameLabel =
        this.timeFrame === "weekly"
          ? item.time_frame_week
          : item.time_frame_month;

      if (timeFrameLabel) {
        if (!acc[timeFrameLabel]) {
          acc[timeFrameLabel] = [];
        }
        acc[timeFrameLabel].push(item);
      }

      return acc;
    }, {} as Record<string, ICopilotUsage[]>);

    return groupByTimeFrame(groupedByTimeFrame);
  }
}

export const dashboardStore = proxy(new DashboardState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as DashboardState;
};

export const DataProvider = ({
  children,
  copilotUsages,
  seatManagement,
}: IProps) => {
  dashboardStore.initData(copilotUsages, seatManagement);
  return <>{children}</>;
};
