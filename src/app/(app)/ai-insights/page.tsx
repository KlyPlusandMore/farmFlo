
import { PageHeader } from "@/components/page-header";
import AiInsightsForm from "@/components/ai-insights-form";

export default function AiInsightsPage() {
  return (
    <>
      <PageHeader 
        title="AI-Powered Insights"
        description="Generate predictive health alerts for your animals using AI."
      />
      <AiInsightsForm />
    </>
  );
}
