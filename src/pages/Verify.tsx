import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ActionTable, Action } from "@/components/ActionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CheckCircle, RefreshCw, Mail, Calendar } from "lucide-react";

// Mock data generator
const generateMockActions = (meetingId: string): Action[] => {
  return [
    {
      id: 1,
      action: "Prepare quarterly revenue report",
      owner: "Alice",
      due: "2025-10-14",
      confidence: 0.82,
      timestamp: "00:12:34",
      transcript_snippet: "Alice mentioned: 'I'll handle the quarterly revenue report by next Friday.'",
      suggestions: [
        "Align deadline with Q4 strategic planning session",
        "Consider adding competitor analysis section",
      ],
    },
    {
      id: 2,
      action: "Schedule follow-up with marketing team",
      owner: "Bob",
      due: "2025-10-10",
      confidence: 0.65,
      timestamp: "00:18:45",
      transcript_snippet: "Bob said: 'We should probably meet with marketing sometime next week.'",
      suggestions: [
        "Set specific agenda items before scheduling",
        "Include product team for better alignment",
      ],
    },
    {
      id: 3,
      action: "Review and approve new feature specifications",
      owner: "Carol",
      due: "2025-10-12",
      confidence: 0.91,
      timestamp: "00:25:12",
      transcript_snippet: "Carol confirmed: 'I will review the feature specs and provide approval by Thursday.'",
      suggestions: [
        "Share specs with stakeholders for early feedback",
      ],
    },
    {
      id: 4,
      action: "Update client on project timeline",
      owner: "David",
      due: "TBD",
      confidence: 0.58,
      timestamp: "00:32:08",
      transcript_snippet: "David mentioned: 'Someone needs to update the client about the timeline changes.'",
      suggestions: [
        "Set definite deadline - client expecting update this week",
        "Prepare written summary of delays and mitigation plan",
      ],
    },
    {
      id: 5,
      action: "Finalize budget allocation for Q4 initiatives",
      owner: "Alice",
      due: "2025-10-15",
      confidence: 0.88,
      timestamp: "00:38:56",
      transcript_snippet: "Alice stated: 'I'll finalize the Q4 budget allocations and share with the team.'",
      suggestions: [
        "Coordinate with finance team for approval",
        "Prioritize strategic growth initiatives per company profile",
      ],
    },
  ];
};

const Verify = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchActions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockActions = generateMockActions(meetingId || "unknown");
        
        // Sort by confidence (low confidence first)
        const sorted = [...mockActions].sort((a, b) => a.confidence - b.confidence);
        
        setActions(sorted);
      } catch (error) {
        console.error("Failed to fetch actions:", error);
        toast.error("Failed to fetch meeting actions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActions();
  }, [meetingId]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Mock API call
      console.log("Verify API called:", {
        meetingId,
        actions,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Actions approved and delivery scheduled!", {
        description: "Email notifications and calendar invites will be sent shortly.",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve actions. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Regenerate with slightly different suggestions
      const mockActions = generateMockActions(meetingId || "unknown");
      setActions(mockActions.sort((a, b) => a.confidence - b.confidence));
      
      toast.success("Suggestions regenerated!");
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error("Failed to regenerate suggestions.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">Analyzing meeting...</p>
          </div>
        </div>
      </>
    );
  }

  const lowConfidenceCount = actions.filter(a => a.confidence < 0.7).length;

  return (
    <>
      <Header />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Verify Actions for Meeting</h1>
            <p className="text-muted-foreground">
              Review and edit extracted actions (1-2 min). {lowConfidenceCount > 0 && (
                <span className="text-destructive font-medium">
                  {lowConfidenceCount} item{lowConfidenceCount > 1 ? 's' : ''} flagged for low confidence.
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Meeting ID: <span className="font-mono">{meetingId}</span>
            </p>
          </div>

          {/* Actions Table */}
          <ActionTable initialActions={actions} onActionsChange={setActions} />

          {/* Preview Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Preview Delivery
              </CardTitle>
              <CardDescription>
                Role-tailored emails and calendar invites will be sent based on company profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {actions
                  .reduce((acc, action) => {
                    if (!acc.find((a: Action) => a.owner === action.owner)) {
                      acc.push(action);
                    }
                    return acc;
                  }, [] as Action[])
                  .slice(0, 3)
                  .map((action, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-md">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">{action.owner[0]}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">Email to {action.owner}</div>
                        <div className="text-sm text-muted-foreground">
                          "Your action items from today's meeting - prioritized for strategic growth alignment..."
                        </div>
                      </div>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating || isApproving}
              className="order-2 sm:order-1"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Suggestions
                </>
              )}
            </Button>

            <Button
              onClick={handleApprove}
              disabled={isApproving || isRegenerating}
              variant="success"
              size="lg"
              className="order-1 sm:order-2"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve & Deliver
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Verify;
