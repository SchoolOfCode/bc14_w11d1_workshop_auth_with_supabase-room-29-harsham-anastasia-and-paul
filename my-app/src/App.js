import "./App.css";
import "./index.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);

  // getMessages();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // getMessages();
    console.log("WORKING");
    // console.log(session.user.id);
    // console.log(session);

    return () => subscription.unsubscribe();
  }, []);

  async function getMessages() {
    let { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("author_id", session.user.id);
    if (error) {
      console.log("error", error);
    }
    console.log("messages", messages);
    setMessages(messages);
  }

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
    // getMessages();
    return (
      <div>
        <div>Logged in!</div>
        <p>Welcome, {session.user.email}</p>
        <button onClick={handleLogout}>Log Out</button>
        {messages.map((message) => (
          <div key={message.id}>
            <h3>{message.created_at}</h3>
            <p>{message.message}</p>
          </div>
        ))}
      </div>
    );
  }
}

export default App;
