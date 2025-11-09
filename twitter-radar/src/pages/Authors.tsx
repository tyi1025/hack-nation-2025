import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export default function Authors() {
  const { data: authors, isLoading } = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("follower_count", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Authors
            </h1>
            <p className="text-muted-foreground mt-1">
              Tracked social media accounts and credibility metrics
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {authors?.length || 0} Authors
          </Badge>
        </div>

        <Card className="border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Platform</TableHead>
                  <TableHead className="text-muted-foreground">Username</TableHead>
                  <TableHead className="text-muted-foreground">Display Name</TableHead>
                  <TableHead className="text-muted-foreground">Followers</TableHead>
                  <TableHead className="text-muted-foreground">Verified</TableHead>
                  <TableHead className="text-muted-foreground">Disinfo Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading authors...
                    </TableCell>
                  </TableRow>
                ) : authors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No authors tracked yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  authors?.map((author) => (
                    <TableRow key={author.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {author.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        @{author.username}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {author.display_name || "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {author.follower_count?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {author.is_verified ? (
                          <Badge className="bg-success">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {author.disinformation_flags > 0 ? (
                          <Badge variant="destructive">
                            {author.disinformation_flags} flags
                          </Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
