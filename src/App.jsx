//hämta useEffect from React
import { useEffect, useState } from "react";

export const App = () => {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (<div>
    {thoughts.map((thought) => (
      <p key={thought._id}>{thought.message}</p>
    ))}</div>
  );
};
