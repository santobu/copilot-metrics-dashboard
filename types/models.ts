export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface GitHubTeam {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  name: string;
  slug: string;
  description: string;
  privacy: string;
  notification_setting: string;
  permission: string;
  members_url: string;
  repositories_url: string;
  parent: string | null;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string | null;
}

export interface SeatAssignment {
  created_at: Date;
  updated_at: Date;
  pending_cancellation_date: Date | null;
  last_activity_at: Date;
  last_activity_editor: string;
  plan_type: string;
  assignee: GitHubUser;
  assigning_team: GitHubTeam;
  organization: GitHubOrganization;
}
