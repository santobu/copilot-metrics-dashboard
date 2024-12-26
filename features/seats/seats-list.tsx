"use client";

import { useDashboard } from "./seats-state";
import { ChartHeader } from "@/features/common/chart-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { stringIsNullOrEmpty } from "@/utils/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

function formatEditorName(editor: string | undefined): string {
  if (stringIsNullOrEmpty(editor)) {
    return editor || "-";
  }
  const editorInfo = editor.split("/");
  const editorName = `${editorInfo[0]} (${editorInfo[1]})`;

  return editorName;
}

export const SeatsList = () => {
  const { filteredData } = useDashboard();
  const currentData = filteredData;

  return (
    <Card className="col-span-4">
      <ChartHeader title="Assigned Seats" description="" />
      <CardContent>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Create Date</TableHead>
              {/* <TableHead>Update Date</TableHead> */}
              <TableHead>Last Activity Date</TableHead>
              <TableHead>Last Activity Editor</TableHead>
              {/* <TableHead>Plan</TableHead> */}
              {/* <TableHead>Pending Cancellation</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData?.seats.allSeats?.map((data: any, index: number) => {
              const createdAt = new Date(data.created_at);
              // const updatedAt = new Date(data.updated_at);
              const lastActivityAt = data.last_activity_at
                ? new Date(data.last_activity_at)
                : "";
              // const pendingCancellationDate = data.pending_cancellation_date
              //   ? new Date(data.pending_cancellation_date)
              //   : null;

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        className="h-10 w-10"
                        src={data.assignee.avatar_url}
                        alt={data.assignee.login}
                      />
                      <AvatarFallback>
                        {data.assignee.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{data.assignee.login}</TableCell>
                  <TableCell>
                    {createdAt.toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  {/* <TableCell>{updatedAt.toLocaleDateString()}</TableCell> */}
                  <TableCell>
                    {lastActivityAt
                      ? lastActivityAt.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {formatEditorName(data.last_activity_editor)}
                  </TableCell>
                  {/* <TableCell>{data.plan_type}</TableCell> */}
                  {/* <TableCell>
                    {pendingCancellationDate
                      ? pendingCancellationDate.toLocaleDateString()
                      : "N/A"}
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
