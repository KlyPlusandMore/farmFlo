import { PageHeader } from "@/components/page-header";
import AiDiagnosticsForm from "@/components/ai-diagnostics-form";

export default function AiInsightsPage() {
  return (
    <>
      <PageHeader 
        title="AI-Powered Diagnostics"
        description="Generate vehicle diagnostic insights using AI."
      />
      <AiDiagnosticsForm />
    </>
  );
}
