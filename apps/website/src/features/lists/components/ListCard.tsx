import { CalendarDays, FileText } from "lucide-solid";
import { Component } from "solid-js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppList } from "@/features/app-data";
import { cn } from "@/libs/cn";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const ListCard: Component<{ list: AppList }> = (props) => {
  return (
    <Card
      color="custom"
      class={cn(
        "flex h-full w-full flex-col",
        "transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg",
      )}
      style={{
        "background-color": `color-mix(in oklch, ${props.list.color} 15%, transparent)`,
      }}
    >
      <CardHeader>
        <CardTitle class="min-w-0 truncate text-2xl font-bold">{props.list.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <CalendarDays class="h-5 w-5 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              Last modified: {dateFormat.format(props.list.updatedAt)}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <FileText class="h-5 w-5 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              Created: {dateFormat.format(props.list.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListCard;
