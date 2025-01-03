"use client";

import { AssignedUser } from "@/components/assigned-user";
import { TaskCommentSheet } from "@/components/sheets/task-comment-sheet";
import { useI18n } from "@/locales/client";
import type { RiskMitigationTask, TaskComments, User } from "@bubba/db";
import { Button } from "@bubba/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@bubba/ui/card";
import { EmptyCard } from "@bubba/ui/empty-card";
import { format } from "date-fns";
import { MessageSquare, PencilIcon } from "lucide-react";
import { useQueryState } from "nuqs";

export function TaskComment({
  task,
  users,
}: {
  task: RiskMitigationTask & { TaskComments: TaskComments[] };
  users: User[];
}) {
  const [open, setOpen] = useQueryState("task-comment-sheet");
  const t = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between gap-2">
            {t("risk.tasks.comments.title")}
            <Button variant="outline" onClick={() => setOpen("true")}>
              {t("risk.tasks.comments.add")}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {task.TaskComments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {task.TaskComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-2 border p-4">
                <div className="flex items-center gap-2">{comment.content}</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <AssignedUser
                      fullName={
                        users.find((user) => user.id === comment.ownerId)?.name
                      }
                      avatarUrl={
                        users.find((user) => user.id === comment.ownerId)?.image
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      ({format(comment.createdAt, "MMM d, yyyy")})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyCard
            title={t("risk.tasks.comments.empty.title")}
            icon={MessageSquare}
            description={t("risk.tasks.comments.empty.description")}
            className="w-full"
          />
        )}
      </CardContent>

      <TaskCommentSheet task={task} />
    </Card>
  );
}