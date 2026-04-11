import { Match, Switch, createMemo, createSignal } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@renderer/components/ui/card";
import {
  appVersion,
  checkForUpdate,
  lastCheckedForUpdate,
  updateStatus,
} from "@renderer/features/updater/update-state";

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export default function SettingsSectionUpdater() {
  const [checking, setChecking] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const isDownloading = createMemo(() => {
    const status = updateStatus();
    return status.type === "downloading" || status.type === "update-available";
  });

  async function handleCheckForUpdate() {
    setChecking(true);
    setError(null);
    try {
      await checkForUpdate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check for updates");
    } finally {
      setChecking(false);
    }
  }

  const statusText = createMemo(() => {
    const status = updateStatus();
    if (status.type === "error") return status.error ?? "Update check failed";
    if (status.type === "update-downloaded") return `Version ${status.version} ready to install`;
    if (status.type === "update-not-available") {
      const lastChecked = lastCheckedForUpdate();
      const relative = lastChecked ? formatRelativeTime(lastChecked) : null;
      return `Up to date — v${appVersion()}${relative ? ` (last checked: ${relative})` : ""}`;
    }
    return null;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">App Updates</CardTitle>
        <CardDescription>Check for new versions of the application.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <Switch>
          <Match when={isDownloading()}>
            <Button disabled>Downloading...</Button>
            <p class="text-sm text-muted-foreground">
              A notification will appear when the download is finished. You can continue using the
              app in the meantime.
            </p>
          </Match>
          <Match when={!isDownloading()}>
            <Button onClick={handleCheckForUpdate} disabled={checking()}>
              {checking() ? "Checking..." : "Check for Updates"}
            </Button>
          </Match>
        </Switch>

        {error() && <p class="text-sm text-destructive">{error()}</p>}

        {!error() && statusText() && <p class="text-sm text-muted-foreground">{statusText()}</p>}
      </CardContent>
    </Card>
  );
}
