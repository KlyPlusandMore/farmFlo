import { PageHeader } from "@/components/page-header";
import AiInsightsForm from "@/components/ai-insights-form";

export default function AiInsightsPage() {
  return (
    <>
      <PageHeader 
        title="AI-Powered Insights"
        description="Generate predictive insights for gestation and sale weights using AI."
      />
      <AiInsightsForm />
    </>
  );
}
