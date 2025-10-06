import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { UploadForm } from "@/components/UploadForm";
import { ProfileForm } from "@/components/ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mic, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock recent meetings data
  const recentMeetings = [
    // Empty for now - will be populated after uploads
  ];

  return (
    <>
      <Header />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              AI Meeting Triage + Smart Optimization
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Beyond basics—upload audio + company profile for personalized tasks, role-tailored
              emails, and efficiency suggestions.
            </p>
          </div>

          {user ? (
            <>
              {/* Upload Section */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Upload Meeting
                  </CardTitle>
                  <CardDescription>
                    Upload your audio recording and let AI extract actionable tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadForm />
                </CardContent>
              </Card>

              <Separator />

              {/* Profile Upload Section */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Upload your company profile for personalized AI suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>

              <Separator />

              {/* Recent Meetings Section */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Meetings</CardTitle>
                  <CardDescription>
                    View and manage your processed meetings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentMeetings.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentMeetings.map((meeting: any) => (
                            <TableRow key={meeting.id}>
                              <TableCell className="font-mono text-sm">
                                {meeting.id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>{meeting.date}</TableCell>
                              <TableCell>{meeting.status}</TableCell>
                              <TableCell>{meeting.actions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg mb-2">No meetings yet.</p>
                      <p className="text-sm">Upload your first meeting audio to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-card">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Please sign in to upload meetings and access AI-powered features.
                </p>
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Index;
