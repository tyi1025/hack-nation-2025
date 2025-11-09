import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles, Play, Pause } from 'lucide-react';

export const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-trend-data');
      
      if (error) throw error;

      if (!autoGenerate) {
        toast.success('Test data generated successfully!', {
          description: `Added ${data.stats.authors} authors, ${data.stats.topics} topics, and ${data.stats.posts} posts`
        });
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      if (!autoGenerate) {
        toast.error('Failed to generate test data', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoGenerate) {
      // Generate immediately when turned on
      handleSeedData();
      // Then generate every 5 seconds
      interval = setInterval(handleSeedData, 5000);
      toast.success('Auto-generation enabled', {
        description: 'New data will be generated every 5 seconds'
      });
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoGenerate]);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSeedData}
        disabled={loading || autoGenerate}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Generate Once
      </Button>
      
      <Button
        onClick={() => setAutoGenerate(!autoGenerate)}
        disabled={loading}
        variant={autoGenerate ? "default" : "outline"}
        size="sm"
        className="gap-2"
      >
        {autoGenerate ? (
          <>
            <Pause className="h-4 w-4" />
            Stop Auto-Gen
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Start Auto-Gen
          </>
        )}
      </Button>
    </div>
  );
};
