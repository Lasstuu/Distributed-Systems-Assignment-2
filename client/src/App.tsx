import { useState } from 'react'
import './App.css'

const addNote = async (topic: string, title: string, text: string) => {
    try {
        const response = await fetch("http://localhost:3000/addnote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ topic, title, text }),
        });
        return await response.json();
    } catch (error: any) {
        return { error: error.message };
    }
}
const getNotes = async (getTopic: string) => {
    try {
        const response = await fetch(`http://localhost:3000/getnotes/${getTopic}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }

        );
        return await response.json();
    } catch (error: any) {
        return { error: error.message };
    }
}


function App() {
  const [topic, setTopic] = useState("");
  const [getTopic, setGetTopic] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const handleAddNote = async () => {
      const response = await addNote(topic, title, text);
      if (response.error) {
          alert(response.error);
      } else {
          setTitle("");
          setText("");
          alert("Note added!");
      }
  };

  const handleGetNotes = async () => {
      const response = await getNotes(getTopic);
      if (response.error) {
          alert(response.error);
          setNotes([]);
      } else {
          setNotes(response.notes);
      }
  };

  return (
    <>
      <h1>Notes</h1>
        <div>
            <h3>Add Note</h3>
            <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={handleAddNote}>Add Note</button>
        </div>

        <div>
            <h3>Get Notes by Topic</h3>
            <input type="text" placeholder="Topic" value={getTopic} onChange={(e) => setGetTopic(e.target.value)} />
            <button onClick={handleGetNotes}>Fetch Notes</button>
        </div>


        <div>
            <h3>Notes</h3>
            {notes.length === 0 ? <p>No notes found.</p> : 
                notes.map((note, index) => (
                    <div key={index}>
                        <p><strong>Title: {note.$.name}</strong></p>
                        <p><strong>Text: </strong>{note.text}</p>
                        <small>{note.timestamp}</small>
                    </div>
                ))}
        </div>
      </>
  )
}

export default App
