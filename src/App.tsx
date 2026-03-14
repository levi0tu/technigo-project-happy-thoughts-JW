import { useEffect, useState, type FormEvent } from "react";

type Thought = {
  _id: string;
  message: string;
  hearts: number;
  createdAt: string;
};

type ApiError = {
  message?: string;
  error?: string;
};

export const App = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not get any happy thoughts :(");
        }

        return res.json();
      })
      .then((data: Thought[]) => setThoughts(data))
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    try {
      const res = await fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data: Thought | ApiError = await res.json();

      if (!res.ok) {
        const apiMessage =
          data.message || data.error || "Could not post thought. Please try again.";
        throw new Error(apiMessage);
      }

      const newThought = data as Thought;
      setThoughts((prev) => [newThought, ...prev]);
      setMessage("");
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong.");
      }
    }
  };

  const sortedThoughts = [...thoughts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const timeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffSec = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffSec < 60) return `${diffSec} seconds ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minutes ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    return created.toLocaleDateString("sv-SE");
  };

  const handleLike = async (id: string) => {
    try {
      const res = await fetch(
        `https://happy-thoughts-api-4ful.onrender.com/thoughts/${id}/like`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Could not like thought");
      }

      setThoughts((prev) =>
        prev.map((thought) =>
          thought._id === id ? { ...thought, hearts: thought.hearts + 1 } : thought
        )
      );
    } catch {
      setSubmitError("Could not like thought. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="app">
      <form onSubmit={handleSubmit} className="message-card">
        <label htmlFor="message">What&apos;s making you happy right now?</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your thoughts..."
        />
        <button className="submit-btn" type="submit">
          {"<3"} Send Happy Thought {"<3"}
        </button>
        {submitError && <p>{submitError}</p>}
      </form>

      {sortedThoughts.map((thought) => (
        <article key={thought._id} className="thought-card">
          <p>{thought.message}</p>
          <div className="thought-footer">
            <div>
              <button
                type="button"
                aria-label={`Like thought: ${thought.message}`}
                className={`heart-btn ${thought.hearts === 0 ? "is-zero" : "is-liked"}`}
                onClick={() => handleLike(thought._id)}
              >
                {"<3"}
              </button>{" "}
              x {thought.hearts}
            </div>
            <small className="time-text">{timeAgo(thought.createdAt)}</small>
          </div>
        </article>
      ))}
    </main>
  );
};
