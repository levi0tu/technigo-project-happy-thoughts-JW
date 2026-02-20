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
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmed = message.trim();

    if (!trimmed) {
      setSubmitError("Write a thought first.");
      return;
    }
    if (trimmed.length < 5) {
      setSubmitError("Your thought must be at least 5 signs.");
      return;
    }
    if (trimmed.length > 140) {
      setSubmitError("Your thought can not be more than 140 signs.");
      return;
    }
    //felmeddelande när texten är annat än 5-140 tecken
    try {
      const res = await fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        const apiMessage =
          data?.message ||
          data?.error ||
          "Could not post thought. Please try again.";
        throw new Error(apiMessage);
      }

      setThoughts((prev) => [data, ...prev]);
      setMessage("");
    } catch (err) {
      setSubmitError(err.message);
    }
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
  };

  //hämta och uppdatera likes
  const handleLike = async (id) => {
    try {
      const res = await fetch(`https://happy-thoughts-api-4ful.onrender.com/thoughts/${id}/like`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Could not like thought");
      setThoughts((prev) =>
        prev.map((thought) =>
          thought._id === id ? { ...thought, hearts: thought.hearts + 1 } : thought));
    } catch (err) { setSubmitError("Could not like thought. Please try again"); }
  }


  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

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
        {submitError && <p>{submitError}</p>}
      </form>

      {sortedThoughts.map((thought) => (
        <article key={thought._id} className="thought-card">
          <p>{thought.message}</p>
          <div className="thought-footer">
            <div>
              <button type="button"
                aria-label={`Like thought: ${thought.message}`} className={`heart-btn ${thought.hearts === 0 ? "is-zero" : "is-liked"}`} onClick={() => handleLike(thought._id)}>❤️ </button> x {thought.hearts}</div>
            <small className="time-text"> {timeAgo(thought.createdAt)}</small>
          </div>
        </article>
      ))}</main>
  );
};
