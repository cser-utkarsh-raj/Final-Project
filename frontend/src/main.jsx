import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ClipboardList, LogOut, PackagePlus, RefreshCcw, Send, ShieldCheck, X } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const STORAGE_KEY = 'stationery.session';
const CATEGORIES = ['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'MARKER', 'FILE', 'ERASER', 'OTHER'];
const DEFAULT_ADMIN_CREDS = { fullName: '', email: 'admin@college.edu', password: 'Admin@123', role: 'ADMIN' };
const DEFAULT_STUDENT_CREDS = { fullName: '', email: '', password: '', role: 'STUDENT' };
const EMPTY_ITEM_FORM = { name: '', category: 'PEN', unit: 'piece', availableQuantity: 0, minimumQuantity: 0 };
const EMPTY_REQUEST_LINE = { itemId: '', itemName: '', quantity: 1 };

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
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('catalog');

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  if (!session) return <AuthScreen onSession={setSession} />;

  const isAdmin = session.role === 'ADMIN';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={24} />
          <div>
            <strong>StoreBook</strong>
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
  const [form, setForm] = useState(DEFAULT_ADMIN_CREDS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(mode === 'register' ? DEFAULT_STUDENT_CREDS : DEFAULT_ADMIN_CREDS);
    setError('');
  }, [mode]);

  function submit(event) {
    event.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Email and password required');
      return;
    }
    if (mode === 'register' && !form.fullName) {
      setError('Full name required');
      return;
    }
    
    setLoading(true);
    apiFetch(`/api/auth/${mode}`, null, {
      method: 'POST',
      body: JSON.stringify(mode === 'login' ? { email: form.email, password: form.password } : form)
    }).then(onSession).catch(err => setError(err.message)).finally(() => setLoading(false));
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>StoreBook</h1>
        <p>Inventory and stationery request tracking for students and administrators.</p>
        <div className="segmented">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && <input placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} disabled={loading} />}
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={loading} />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} disabled={loading} />
          {mode === 'register' && (
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={loading}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}
          {error && <div className="error">{error}</div>}
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create account')}</button>
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
  const [form, setForm] = useState(EMPTY_ITEM_FORM);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function submit(event) {
    event.preventDefault();
    setMessage('');
    
    if (!form.name.trim()) {
      setMessage('Item name required');
      return;
    }
    if (form.availableQuantity < 0 || form.minimumQuantity < 0) {
      setMessage('Quantities cannot be negative');
      return;
    }
    
    setLoading(true);
    apiFetch('/api/items', session.token, { method: 'POST', body: JSON.stringify(form) })
      .then(() => {
        setMessage('Item added to inventory.');
        setForm(EMPTY_ITEM_FORM);
      })
      .catch(err => setMessage(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <section className="form-section">
      <h2>Add Stationery Item</h2>
      <form className="data-form" onSubmit={submit}>
        <input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} disabled={loading}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} disabled={loading} />
        <input type="number" min="0" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: Number(e.target.value) || 0 })} disabled={loading} />
        <input type="number" min="0" value={form.minimumQuantity} onChange={e => setForm({ ...form, minimumQuantity: Number(e.target.value) || 0 })} disabled={loading} />
        <button className="primary" type="submit" disabled={loading}><PackagePlus size={18} /> {loading ? 'Adding...' : 'Add item'}</button>
      </form>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}

function Requests({ session }) {
  return session.role === 'ADMIN' ? <AdminRequests session={session} /> : <StudentRequests session={session} />;
}

function StudentRequests({ session }) {
  const [line, setLine] = useState(EMPTY_REQUEST_LINE);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch('/api/requests/mine', session.token).then(data => setRequests(data.content || [])).catch(err => setMessage(err.message));
  }

  useEffect(load, [session.token]);

  function submit(event) {
    event.preventDefault();
    setMessage('');
    
    if (!line.itemId || !line.itemName || line.quantity < 1) {
      setMessage('Item ID, name, and quantity (min 1) required');
      return;
    }
    
    setLoading(true);
    apiFetch('/api/requests', session.token, {
      method: 'POST',
      body: JSON.stringify({ items: [{ itemId: Number(line.itemId), itemName: line.itemName, quantity: Number(line.quantity) }] })
    }).then(() => {
      setLine(EMPTY_REQUEST_LINE);
      setMessage('Request submitted.');
      load();
    }).catch(err => setMessage(err.message)).finally(() => setLoading(false));
  }

  return (
    <section className="split">
      <div>
        <h2>Submit Request</h2>
        <form className="data-form" onSubmit={submit}>
          <input placeholder="Item ID" value={line.itemId} onChange={e => setLine({ ...line, itemId: e.target.value })} disabled={loading} />
          <input placeholder="Item name" value={line.itemName} onChange={e => setLine({ ...line, itemName: e.target.value })} disabled={loading} />
          <input type="number" min="1" value={line.quantity} onChange={e => setLine({ ...line, quantity: Number(e.target.value) || 1 })} disabled={loading} />
          <button className="primary" type="submit" disabled={loading}><Send size={18} /> {loading ? 'Submitting...' : 'Submit'}</button>
        </form>
        {message && <p className="notice">{message}</p>}
      </div>
      <RequestTable requests={requests} />
    </section>
  );
}

function AdminRequests({ session }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function load() {
    setError('');
    apiFetch('/api/requests', session.token)
      .then(data => setRequests(data.content || []))
      .catch(err => setError(err.message));
  }
  
  useEffect(load, [session.token]);

  function decide(id, action) {
    setLoading(id);
    const options = action === 'reject'
      ? { method: 'POST', body: JSON.stringify({ reason: 'Not approved by stores office' }) }
      : { method: 'POST' };
    apiFetch(`/api/requests/${id}/${action}`, session.token, options)
      .then(load)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <>
      {error && <div className="error" style={{ margin: '1rem' }}>{error}</div>}
      <RequestTable requests={requests} admin onApprove={id => decide(id, 'approve')} onReject={id => decide(id, 'reject')} />
    </>
  );
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
              <td>{request.items?.map(item => `${item.itemName} x${item.quantity}`).join(', ') || '-'}</td>
              {admin && request.status === 'PENDING' && (
                <td className="actions">
                  <button title="Approve" onClick={() => onApprove(request.id)}><Check size={17} /></button>
                  <button title="Reject" onClick={() => onReject(request.id)}><X size={17} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
