import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Settings, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Config() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});

  const { data: configs, isLoading } = useQuery({
    queryKey: ["crawler_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crawler_config")
        .select("*")
        .order("config_key");
      
      if (error) throw error;
      return data;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: any }) => {
      const { error } = await supabase
        .from("crawler_config")
        .update({ config_value: value })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler_config"] });
      setEditingConfig({});
      toast({
        title: "Configuration Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = (id: string) => {
    const newValue = editingConfig[id];
    if (newValue) {
      try {
        const parsed = JSON.parse(newValue);
        updateConfigMutation.mutate({ id, value: parsed });
      } catch (e) {
        toast({
          title: "Invalid JSON",
          description: "Please ensure the configuration is valid JSON format.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Crawler Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage keywords, velocity thresholds, and platform settings
          </p>
        </div>

        {isLoading ? (
          <Card className="p-6 border-border bg-card">
            <p className="text-center text-muted-foreground">Loading configuration...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {configs?.map((config) => (
              <Card key={config.id} className="p-6 border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {config.config_key}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    JSON
                  </Badge>
                </div>

                <Textarea
                  value={
                    editingConfig[config.id] !== undefined
                      ? editingConfig[config.id]
                      : JSON.stringify(config.config_value, null, 2)
                  }
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, [config.id]: e.target.value })
                  }
                  className="font-mono text-sm min-h-[200px] bg-muted/30 border-border text-foreground"
                  placeholder="Enter JSON configuration..."
                />

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave(config.id)}
                    disabled={editingConfig[config.id] === undefined}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 border-border bg-card/50">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Configuration Guide
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">keywords:</span> Define categories and
              keywords for filtering posts. The crawler will match posts containing any of these
              keywords.
            </p>
            <p>
              <span className="font-medium text-foreground">velocity_threshold:</span> Set the
              minimum engagement per hour and views required to flag a post as high-velocity.
            </p>
            <p>
              <span className="font-medium text-foreground">platforms:</span> Enable or disable
              specific platforms for crawling.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
