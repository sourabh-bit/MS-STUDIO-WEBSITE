import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OfflineClasses from "@/components/classes/OfflineClasses";
import OnlineClasses from "@/components/classes/OnlineClasses";
// import ClassesHeader from "@/components/classes/ClassesHeader";

const Classes = () => {
  const [activeTab, setActiveTab] = useState("offline");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-5 md:pt-7">
        <Link
          to="/"
          aria-label="Back to homepage"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dusty-rose/25 bg-background/80 text-foreground shadow-soft backdrop-blur-sm transition hover:-translate-x-0.5 hover:border-dusty-rose/45 hover:text-dusty-rose"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <section className="container mx-auto px-4 pt-4 md:pt-8 pb-20">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex justify-center flex-col">
          <TabsList className="w-full max-w-md mx-auto mb-4 md:mb-16 bg-secondary/50 p-1 h-auto">
            <TabsTrigger 
              value="offline" 
              className="flex-1 py-3 px-6 font-serif text-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-soft transition-all duration-300"
            >
              Offline Classes
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="flex-1 py-3 px-6 font-serif text-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-soft transition-all duration-300"
            >
              Online Classes
            </TabsTrigger>
          </TabsList>

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




