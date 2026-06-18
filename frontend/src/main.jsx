import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ClipboardList, LogOut, PackagePlus, RefreshCcw, Send, ShieldCheck, X } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function apiFetch(path, token, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  }).then(async response => {
    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(body.message || 'Request failed');
    }
    if (response.status === 204) return null;
    return response.json();
  });
}

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('stationery.session') || 'null'));
  const [view, setView] = useState('catalog');

  useEffect(() => {
    if (session) localStorage.setItem('stationery.session', JSON.stringify(session));
    else localStorage.removeItem('stationery.session');
  }, [session]);

  if (!session) return <AuthScreen onSession={setSession} />;

  const isAdmin = session.role === 'ADMIN';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={24} />
          <div>
            <strong>College Stores</strong>
            <span>{session.role.toLowerCase()}</span>
          </div>
        </div>
        <button className={view === 'catalog' ? 'active' : ''} onClick={() => setView('catalog')}><ClipboardList size={18} /> Catalog</button>
        {isAdmin && <button className={view === 'inventory' ? 'active' : ''} onClick={() => setView('inventory')}><PackagePlus size={18} /> Inventory</button>}
        <button className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}><Send size={18} /> Requests</button>
        <button className="logout" onClick={() => setSession(null)}><LogOut size={18} /> Sign out</button>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>Stationery Management System</h1>
            <p>{session.fullName} • {session.email}</p>
          </div>
        </header>
        {view === 'catalog' && <Catalog session={session} />}
        {view === 'inventory' && isAdmin && <InventoryAdmin session={session} />}
        {view === 'requests' && <Requests session={session} />}
      </main>
    </div>
  );
}

function AuthScreen({ onSession }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: 'admin@college.edu', password: 'Admin@123', role: 'ADMIN' });
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setError('');
    apiFetch(`/api/auth/${mode}`, null, {
      method: 'POST',
      body: JSON.stringify(mode === 'login' ? { email: form.email, password: form.password } : form)
    }).then(onSession).catch(err => setError(err.message));
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>College Stores</h1>
        <p>Inventory and stationery request tracking for students and administrators.</p>
        <div className="segmented">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && <input placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />}
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {mode === 'register' && (
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}
          {error && <div className="error">{error}</div>}
          <button className="primary" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </section>
    </main>
  );
}

function Catalog({ session }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch('/api/items?size=20&sort=name', session.token).then(data => setItems(data.content || [])).finally(() => setLoading(false));
  }

  useEffect(load, [session.token]);

  return (
    <section>
      <div className="section-title"><h2>Catalog</h2><button className="icon-button" title="Refresh" onClick={load}><RefreshCcw size={18} /></button></div>
      {loading ? <p>Loading inventory...</p> : <div className="grid">{items.map(item => <ItemCard key={item.id} item={item} />)}</div>}
    </section>
  );
}

function ItemCard({ item }) {
  return (
    <article className="item-card">
      <div>
        <span className="badge">{item.category}</span>
        {item.lowStock && <span className="badge warning">Low stock</span>}
      </div>
      <h3>{item.name}</h3>
      <p>{item.availableQuantity} {item.unit} available</p>
      <small>Minimum level: {item.minimumQuantity}</small>
    </article>
  );
}

function InventoryAdmin({ session }) {
  const [form, setForm] = useState({ name: '', category: 'PEN', unit: 'piece', availableQuantity: 0, minimumQuantity: 0 });
  const [message, setMessage] = useState('');

  function submit(event) {
    event.preventDefault();
    setMessage('');
    apiFetch('/api/items', session.token, { method: 'POST', body: JSON.stringify(form) })
      .then(() => {
        setMessage('Item added to inventory.');
        setForm({ name: '', category: 'PEN', unit: 'piece', availableQuantity: 0, minimumQuantity: 0 });
      })
      .catch(err => setMessage(err.message));
  }

  return (
    <section className="form-section">
      <h2>Add Stationery Item</h2>
      <form className="data-form" onSubmit={submit}>
        <input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'MARKER', 'FILE', 'ERASER', 'OTHER'].map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
        <input type="number" min="0" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: Number(e.target.value) })} />
        <input type="number" min="0" value={form.minimumQuantity} onChange={e => setForm({ ...form, minimumQuantity: Number(e.target.value) })} />
        <button className="primary" type="submit"><PackagePlus size={18} /> Add item</button>
      </form>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}

function Requests({ session }) {
  return session.role === 'ADMIN' ? <AdminRequests session={session} /> : <StudentRequests session={session} />;
}

function StudentRequests({ session }) {
  const [line, setLine] = useState({ itemId: '', itemName: '', quantity: 1 });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  function load() {
    apiFetch('/api/requests/mine', session.token).then(data => setRequests(data.content || []));
  }

  useEffect(load, [session.token]);

  function submit(event) {
    event.preventDefault();
    setMessage('');
    apiFetch('/api/requests', session.token, {
      method: 'POST',
      body: JSON.stringify({ items: [{ itemId: Number(line.itemId), itemName: line.itemName, quantity: Number(line.quantity) }] })
    }).then(() => {
      setLine({ itemId: '', itemName: '', quantity: 1 });
      setMessage('Request submitted.');
      load();
    }).catch(err => setMessage(err.message));
  }

  return (
    <section className="split">
      <div>
        <h2>Submit Request</h2>
        <form className="data-form" onSubmit={submit}>
          <input placeholder="Item ID" value={line.itemId} onChange={e => setLine({ ...line, itemId: e.target.value })} />
          <input placeholder="Item name" value={line.itemName} onChange={e => setLine({ ...line, itemName: e.target.value })} />
          <input type="number" min="1" value={line.quantity} onChange={e => setLine({ ...line, quantity: e.target.value })} />
          <button className="primary" type="submit"><Send size={18} /> Submit</button>
        </form>
        {message && <p className="notice">{message}</p>}
      </div>
      <RequestTable requests={requests} />
    </section>
  );
}

function AdminRequests({ session }) {
  const [requests, setRequests] = useState([]);

  function load() {
    apiFetch('/api/requests', session.token).then(data => setRequests(data.content || []));
  }
  useEffect(load, [session.token]);

  function decide(id, action) {
    const options = action === 'reject'
      ? { method: 'POST', body: JSON.stringify({ reason: 'Not approved by stores office' }) }
      : { method: 'POST' };
    apiFetch(`/api/requests/${id}/${action}`, session.token, options).then(load);
  }

  return <RequestTable requests={requests} admin onApprove={id => decide(id, 'approve')} onReject={id => decide(id, 'reject')} />;
}

function RequestTable({ requests, admin, onApprove, onReject }) {
  return (
    <div className="table-wrap">
      <h2>{admin ? 'Student Requests' : 'My Requests'}</h2>
      <table>
        <thead><tr><th>ID</th><th>Student</th><th>Status</th><th>Items</th>{admin && <th>Action</th>}</tr></thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td>#{request.id || '-'}</td>
              <td>{request.studentEmail}</td>
              <td><span className={`status ${request.status.toLowerCase()}`}>{request.status}</span></td>
              <td>{request.items.map(item => `${item.itemName} x ${item.quantity}`).join(', ')}</td>
              {admin && <td className="actions"><button title="Approve" onClick={() => onApprove(request.id)}><Check size={17} /></button><button title="Reject" onClick={() => onReject(request.id)}><X size={17} /></button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
