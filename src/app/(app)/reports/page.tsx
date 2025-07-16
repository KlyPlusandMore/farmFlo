import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Generate and view reports on productivity, profitability, and more." />
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <span>Reports Coming Soon</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This section is under construction. Soon you will be able to generate detailed reports for your farm.
                </p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
