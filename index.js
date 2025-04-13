import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [message, setMessage] = useState('');
  const [intent, setIntent] = useState('Let it go');
  const [submitted, setSubmitted] = useState(false);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    const { data, error } = await supabase
      .from('unsaid_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setFeed(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase.from('unsaid_messages').insert({
      message,
      intent
    });

    if (!error) {
      setSubmitted(true);
      setMessage('');
      fetchFeed();
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-xl text-center mt-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Say what you can’t say —<br />and still be heard.
        </h1>
        <p className="mb-6 text-gray-600">
          Write an anonymous, emotionally-raw message and say what you need to say.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="To my younger self..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-400"
            />
            <div className="flex justify-center gap-4">
              {['Let it go', 'Track it', 'Empathize'].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setIntent(option)}
                  className={`px-4 py-2 rounded border ${
                    intent === option ? 'bg-black text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Write unsaid message
            </button>
          </form>
        ) : (
          <div className="text-green-600 text-lg font-semibold">
            Message submitted anonymously. 💌
          </div>
        )}

        <div className="mt-12 w-full">
          <h2 className="text-xl font-medium mb-2 text-left">📖 Recent Unsaid Messages</h2>
          <div className="space-y-4">
            {feed.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-100 p-4 rounded shadow text-left border border-gray-200"
              >
                <p className="text-gray-800 text-md">{entry.message}</p>
                <span className="text-xs text-gray-500 italic">
                  {entry.intent} • {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
