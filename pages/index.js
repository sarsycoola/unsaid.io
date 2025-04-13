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
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Say what you can’t say — and still be heard.</h1>
      <p>Write an anonymous, emotionally-raw message and say what you need to say.</p>
      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="To my younger self..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <div style={{ marginTop: '0.5rem' }}>
            {['Let it go', 'Track it', 'Empathize'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIntent(option)}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: intent === option ? '#000' : '#eee',
                  color: intent === option ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="submit"
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Write unsaid message
          </button>
        </form>
      ) : (
        <p style={{ color: 'green', marginTop: '1rem' }}>Message submitted anonymously. 💌</p>
      )}
      <div style={{ marginTop: '2rem' }}>
        <h2>📖 Recent Unsaid Messages</h2>
        {feed.map((entry) => (
          <div key={entry.id} style={{ padding: '1rem', border: '1px solid #ccc', marginBottom: '1rem' }}>
            <p>{entry.message}</p>
            <small>{entry.intent} • {new Date(entry.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </main>
  );
}
