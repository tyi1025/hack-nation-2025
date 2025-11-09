import { NavLink } from "@/components/NavLink";
import { TrendingUp, Users, Settings, Activity } from "lucide-react";

export const Navigation = () => {
  const navItems = [
    { to: "/", icon: Activity, label: "Dashboard" },
    { to: "/posts", icon: TrendingUp, label: "Posts" },
    { to: "/authors", icon: Users, label: "Authors" },
    { to: "/config", icon: Settings, label: "Configuration" },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Trend Crawler</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                activeClassName="text-primary bg-primary/10"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
