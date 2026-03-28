import { CalendarDays, FileText } from "lucide-solid";
import { Component } from "solid-js";

import { List } from "@shared";

import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { cn } from "@renderer/libs/cn";
import { transparentOklch } from "@renderer/libs/transparentOklch";

const ListCard: Component<{ list: List }> = (props) => {
  const cardBackgroundColor = transparentOklch(props.list.color, 0.15);
  return (
    <Card
      color="custom"
      class={cn(
        "flex h-full w-full flex-col",
        "transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg",
      )}
      style={{
        "background-color": cardBackgroundColor,
      }}
    >
      <CardHeader>
        <CardTitle class="text-2xl font-bold">{props.list.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <CalendarDays class="text-muted-foreground h-5 w-5" />
            <span class="text-muted-foreground text-sm">
              Last modified: {displayDate(props.list.updatedAt)}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <FileText class="text-muted-foreground h-5 w-5" />
            <span class="text-muted-foreground text-sm">
              Created: {displayDate(props.list.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const displayDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default ListCard;
