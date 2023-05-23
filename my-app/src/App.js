import logo from "./logo.svg";
import "./App.css";
import "./index.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(
  "https://ngqgasxazmdjnwytchcg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncWdhc3hhem1kam53eXRjaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ3Njg1MzgsImV4cCI6MjAwMDM0NDUzOH0.74G6F3HKW26PuD5rqx6JbmAo32ZI560Q-_ik3McF6jg"
);

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="login-container">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          onSignOut={() => setSession(null)}
        />
      </div>
    );
  } else {
    return (
      <div>
        <div>Logged in!</div>
        <p>Welcome, {session.user.email}</p>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    );
  }
}

export default App;
