import { useState } from "react";
import { MapPin, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfflineClasses from "@/components/classes/OfflineClasses";
import OnlineClasses from "@/components/classes/OnlineClasses";
// import ClassesHeader from "@/components/classes/ClassesHeader";

const Classes = () => {
  const [activeTab, setActiveTab] = useState("offline");

  return (
    <main className="min-h-screen bg-background">

      <section className="container mx-auto px-4 pt-6 md:pt-20 pb-20">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex justify-center flex-col">
          <TabsList className="w-full max-w-md mx-auto mb-2 md:mb-2 bg-secondary/50 p-1 h-auto">
            <TabsTrigger
              value="offline"
              className="flex-1 py-3 px-6 font-serif text-lg gap-2 data-[state=inactive]:font-normal data-[state=inactive]:text-foreground/45 data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft transition-all duration-300"
            >
              <MapPin className="h-4 w-4" />
              Offline Classes
            </TabsTrigger>
            <TabsTrigger
              value="online"
              className="flex-1 py-3 px-6 font-serif text-lg gap-2 data-[state=inactive]:font-normal data-[state=inactive]:text-foreground/45 data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft transition-all duration-300"
            >
              <Video className="h-4 w-4" />
              Online Classes
            </TabsTrigger>
          </TabsList>

          <p className="mb-4 text-center font-sans text-xs tracking-[0.2em] text-dusty-rose uppercase md:mb-16">
            {activeTab === "offline"
              ? "In-person - 7 day intensive in New Delhi"
              : "Live online - from anywhere in the world"}
          </p>

          <TabsContent value="online" className="animate-fade-in">
            <OnlineClasses />
          </TabsContent>

          <TabsContent value="offline" className="animate-fade-in">
            <OfflineClasses />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Classes;


