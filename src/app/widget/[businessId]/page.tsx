import { WidgetChat } from "@/components/WidgetChat";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  let themeColor = "#3b82f6";
  let businessName = "Support";

  if (supabase) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name, theme_color")
      .eq("business_id", businessId)
      .single();

    if (business) {
      themeColor = business.theme_color || themeColor;
      businessName = business.name || businessName;
    }
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-transparent">
      <WidgetChat 
        businessId={businessId} 
        themeColor={themeColor} 
        businessName={businessName} 
      />
    </main>
  );
}
