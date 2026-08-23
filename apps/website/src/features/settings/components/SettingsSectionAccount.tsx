import { useNavigate } from "@tanstack/solid-router";
import { Show, createSignal } from "solid-js";

import { ClerkMount } from "@/components/ClerkMount";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClerk } from "@/lib/clerk-provider";
import { deleteAccount } from "@/server/api";

/**
 * New on the web (spec §6): sign out, Clerk's prebuilt user profile (email,
 * password, photo, connected Google account) and account deletion.
 *
 * Deletion is two steps (spec §4): the server function soft-deletes the user's rows
 * while the session is still valid, then the client deletes the Clerk user — which
 * also ends the session — and a full navigation to `/` drops every loader's state.
 */
const SettingsSectionAccount = () => {
  const { clerk } = useClerk();
  const navigate = useNavigate();
  const [deleting, setDeleting] = createSignal(false);
  const [error, setError] = createSignal<string>();

  const signOut = async () => {
    await clerk()?.signOut();
    await navigate({ to: "/" });
  };

  const destroyAccount = async () => {
    const instance = clerk();
    if (!instance?.user || deleting()) return;

    setDeleting(true);
    setError(undefined);
    try {
      await deleteAccount();
      await instance.user.delete();
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete your account.");
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Account</CardTitle>
        <CardDescription>Your sign-in details are managed by Clerk.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger as={Button} variant="destructive" type="button">
              Delete account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your profile, sections, lists and list items will be deleted along with your
                  sign-in. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Show when={error()}>
                {(message) => <p class="text-sm text-red-600">{message()}</p>}
              </Show>
              <AlertDialogFooter>
                <AlertDialogClose disabled={deleting()}>Cancel</AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting()}
                  onClick={() => void destroyAccount()}
                >
                  {deleting() ? "Deleting..." : "Delete account"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div class="overflow-x-auto">
          <ClerkMount
            mount={(instance, node) => instance.mountUserProfile(node)}
            unmount={(instance, node) => instance.unmountUserProfile(node)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSectionAccount;
