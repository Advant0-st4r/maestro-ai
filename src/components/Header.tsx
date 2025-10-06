import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, Upload } from "lucide-react";

export const Header = () => {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 shadow-sm">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold text-foreground">Meeting Maestro</h1>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/">
                <Button variant="outline" size="sm" aria-label="Upload meeting">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Meeting</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleSignIn} size="sm" aria-label="Sign in with Google">
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
