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
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  // getMessages();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getMessages(session);
        getUsers();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getMessages(session);
        getUsers();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getMessages(session) {
    let { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("destination_id", session.user.id);
    if (error) {
      console.log("error", error);
    }
    setMessages(messages);
  }

  async function getUsers() {
    let { data: users, error } = await supabase.from("users").select("*");
    if (error) {
      console.log("error", error);
    }
    setUsers(users);
  }

  async function deleteMessage(messageId) {
    let { data: messages, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);
    if (error) {
      console.log("error", error);
    }
    getMessages(session);
  }

  async function sendMessage(messageText, destinationId) {
    let { data: messages, error } = await supabase.from("messages").insert([
      {
        message: messageText,
        destination_id: destinationId,
        author_id: session.user.id,
      },
    ]);
    if (error) {
      console.log("error", error);
    }
    //refresh the page
    // window.location.reload();
    getMessages(session);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(message, recipient);
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
      <div className="container">
        <div className="login-info">
          <div>Logged in as {session.user.email}</div>
          <button onClick={handleLogout}>Log Out</button>
        </div>
        <div className="bottom-panel">
          <div className="send-message">
            <form onSubmit={handleSubmit} className="send-form">
              <p>Send a message</p>
              <textarea
                placeholder="Type Message Here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="">Select a recipient</option>
                {users.map((user) => {
                  return (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  );
                })}
              </select>
              <button type="submit">Send</button>
            </form>
          </div>
          <div className="right-panel">
            {messages.map((message) => {
              const user = users.find((user) => user.id === message.author_id);
              return (
                <div key={message.id}>
                  <h3>{message.message}</h3>
                  <p>From: {user.email}</p>
                  <p>
                    Sent: {new Date(message.created_at).toLocaleString("en-GB")}
                  </p>
                  <button onClick={() => deleteMessage(message.id)}>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
