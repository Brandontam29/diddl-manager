import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { cn } from "@renderer/libs/cn";
import { TrackerListItem } from "@shared/item-models";
import { CalendarDays, FileText } from "lucide-solid";
import { Component } from "solid-js";

const ListCard: Component<{ trackerListItem: TrackerListItem }> = (props) => {
  return (
    <Card
      class={cn(
        "w-full max-w-md",
        "transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105",
      )}
    >
      <CardHeader>
        <CardTitle class="text-2xl font-bold">{props.trackerListItem.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <CalendarDays class="h-5 w-5 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              Last modified: {displayDate(props.trackerListItem.lastModified)}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <FileText class="h-5 w-5 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              Created: {displayDate(props.trackerListItem.createdAt)}
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
