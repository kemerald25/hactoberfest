import { WidgetChat } from "@/components/WidgetChat";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function StandaloneChatPage({
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
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-full h-screen sm:h-[95vh] sm:max-h-[900px] sm:max-w-[450px] mx-auto sm:rounded-[30px] overflow-hidden shadow-2xl relative border border-border/50 bg-background">
        <WidgetChat 
          businessId={businessId} 
          themeColor={themeColor} 
          businessName={businessName} 
          isStandalone={true}
        />
      </div>
    </div>
  );
}
