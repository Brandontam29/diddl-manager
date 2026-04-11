import { A } from "@solidjs/router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";

export default function NotFound() {
  return (
    <div class="flex items-center justify-center min-h-[60vh]">
      <Card class="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle class="text-6xl font-bold text-muted-foreground">404</CardTitle>
          <CardDescription class="text-lg">Page not found</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardContent>
        <CardFooter class="justify-center">
          <A href="/">
            <Button>Go Home</Button>
          </A>
        </CardFooter>
      </Card>
    </div>
  );
}
