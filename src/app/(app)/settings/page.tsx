import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your application settings." />
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                    <span>Settings Coming Soon</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This section is under construction. Soon you will be able to configure your farm settings here.
                </p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
