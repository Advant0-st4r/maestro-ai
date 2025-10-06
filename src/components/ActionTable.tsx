import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

export type Action = {
  id: number;
  action: string;
  owner: string;
  due: string;
  confidence: number;
  timestamp: string;
  transcript_snippet: string;
  suggestions: string[];
};

type ActionTableProps = {
  initialActions: Action[];
  onActionsChange: (actions: Action[]) => void;
};

export const ActionTable = ({ initialActions, onActionsChange }: ActionTableProps) => {
  const { control, watch } = useForm({
    defaultValues: {
      actions: initialActions,
    },
  });

  const { fields, update } = useFieldArray({
    control,
    name: "actions",
  });

  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());

  const toggleSuggestions = (id: number) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSuggestions(newExpanded);
  };

  const actions = watch("actions");

  // Update parent component when actions change
  useState(() => {
    onActionsChange(actions);
  });

  return (
    <TooltipProvider>
      <div className="border rounded-md overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Owner</TableHead>
              <TableHead className="font-semibold">Due</TableHead>
              <TableHead className="font-semibold">Confidence</TableHead>
              <TableHead className="font-semibold">Timestamp</TableHead>
              <TableHead className="font-semibold">Suggestions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const action = actions[index];
              const isLowConfidence = action.confidence < 0.7;

              return (
                <TableRow
                  key={field.id}
                  className={isLowConfidence ? "bg-destructive/5" : undefined}
                >
                  <TableCell className="font-medium">
                    <Input
                      value={action.action}
                      onChange={(e) => {
                        update(index, { ...action, action: e.target.value });
                        onActionsChange(actions);
                      }}
                      className="border-transparent hover:border-input focus:border-primary transition-colors"
                      aria-label={`Action ${index + 1}`}
                    />
                    {isLowConfidence && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Low confidence
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Input
                      value={action.owner}
                      onChange={(e) => {
                        update(index, { ...action, owner: e.target.value });
                        onActionsChange(actions);
                      }}
                      className="border-transparent hover:border-input focus:border-primary transition-colors"
                      aria-label={`Owner for action ${index + 1}`}
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="date"
                      value={action.due}
                      onChange={(e) => {
                        update(index, { ...action, due: e.target.value });
                        onActionsChange(actions);
                      }}
                      className="border-transparent hover:border-input focus:border-primary transition-colors"
                      aria-label={`Due date for action ${index + 1}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Progress
                        value={action.confidence * 100}
                        className={`h-2 ${
                          isLowConfidence ? "bg-destructive/20" : "bg-success/20"
                        }`}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {Math.round(action.confidence * 100)}%
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1">
                          {action.timestamp}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{action.transcript_snippet}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSuggestions(action.id)}
                      className="w-full justify-between"
                      aria-label={`${
                        expandedSuggestions.has(action.id) ? "Hide" : "Show"
                      } suggestions for action ${index + 1}`}
                    >
                      <span>AI Suggestions</span>
                      {expandedSuggestions.has(action.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    {expandedSuggestions.has(action.id) && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-md space-y-1">
                        {action.suggestions.map((suggestion, sIndex) => (
                          <div key={sIndex} className="text-sm text-muted-foreground">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
