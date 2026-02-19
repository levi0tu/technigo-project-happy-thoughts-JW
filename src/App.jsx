//hämta useEffect from React
import { useEffect, useState } from "react";

export const App = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //lagrar och uppdaterar meddelandet användaren skriver
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState(null);

  //hämta posts från community API, omvandla svaret till data och spara i state
  useEffect(() => {
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
      .then((res) => {
        if (!res.ok) throw new Error("Could not get any happy thoughts :(");
        return res.json();
      })
      .then((data) => setThoughts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError(null);

    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Error");
        }
        return data;
      })
      .then((newThought) => {
        setThoughts((prev) => [newThought, ...prev]);
        setMessage("");
      })
      .catch((err) => setSubmitError(err.message));
  };
  //sorterar senaste posten först
  const sortedThoughts = [...thoughts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  //skriver ut hur länge sen posten skrevs
  const timeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffSec = Math.floor((now - created) / 1000);

    if (diffSec < 60) return `${diffSec} seconds ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minutes ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    return created.toLocaleDateString("sv-SE");


    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>
  };
  //field för post, hämtar och skriver ut meddelande och datum
  return (
    <main className="app">
      <form onSubmit={handleSubmit} className="message-card">
        <label htmlFor="message">What´s making you happy right now?</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your thoughts..." />
        <button className="submit-btn" type="submit">❤️ Send Happy Thought ❤️</button>
        {submitError && <p className="error-text">{submitError}</p>}
      </form>

      {sortedThoughts.map((thought) => (
        <article key={thought._id} className="thought-card">
          <p>{thought.message}</p>
          <div className="thought-footer">
            <div className="likes"></div>
            <small className="time-text"> {timeAgo(thought.createdAt)}</small>
          </div>
        </article>
      ))}</main>
  );
};
