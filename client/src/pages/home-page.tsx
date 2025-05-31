import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Calendar, Trophy, Loader2 } from "lucide-react";
import EventForm from "@/components/event-form";
import { useState } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === "organizer" 
              ? "Manage your coding contests and hackathons"
              : "Join exciting coding contests and hackathons"}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {user?.role === "organizer" && (
            <Button 
              onClick={() => setShowEventForm(true)}
              className="shadow-lg hover:shadow-primary/25 transition-shadow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-muted-foreground">
            No events found
          </h2>
          {user?.role === "organizer" && (
            <Button 
              onClick={() => setShowEventForm(true)}
              variant="outline" 
              className="mt-4"
            >
              Create your first event
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={item}>
              <Link href={`/events/${event.id}`}>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {event.creatorId === user?.id ? (
                        <Trophy className="mr-2 h-5 w-5 text-primary" />
                      ) : (
                        <Calendar className="mr-2 h-5 w-5" />
                      )}
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <span className="font-medium mr-2">Start:</span>
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <span className="font-medium mr-2">End:</span>
                        {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      {event.creatorId === user?.id && (
                        <p className="text-primary font-medium pt-2 border-t">
                          You are the organizer
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {user?.role === "organizer" && (
        <EventForm open={showEventForm} onOpenChange={setShowEventForm} />
      )}
    </div>
  );
}