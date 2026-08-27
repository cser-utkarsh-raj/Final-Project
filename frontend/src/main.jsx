import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ClipboardList, LogOut, PackagePlus, RefreshCcw, Send, ShieldCheck, X, PenTool, Sparkles, Layers } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const STORAGE_KEY = 'stationery.session';
const CATEGORIES = ['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'MARKER', 'FILE', 'ERASER', 'OTHER'];
const DEFAULT_ADMIN_CREDS = { fullName: '', email: 'admin@college.edu', password: 'Admin@123', role: 'ADMIN' };
const DEFAULT_STUDENT_CREDS = { fullName: '', email: '', password: '', role: 'STUDENT' };
const EMPTY_ITEM_FORM = { name: '', category: 'PEN', unit: 'piece', availableQuantity: 0, minimumQuantity: 0 };
const EMPTY_REQUEST_LINE = { itemId: '', itemName: '', quantity: 1 };

const ToastContext = React.createContext(null);

function DotLogo({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width={size} height={size} fill="none">
      <path d="M40 70 L160 70 L160 160 L100 190 L40 160 Z" fill="#E6E0F8" stroke="#121212" strokeWidth="8" strokeLinejoin="round" />
      <path d="M55 85 L145 85 L145 150 L100 172 L55 150 Z" fill="#20B2AA" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M100 25 L108 50 L135 45 L120 65 L145 75 L115 85 L100 110 L85 85 L55 75 L80 65 L65 45 L92 50 Z" fill="#20B2AA" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M100 45 L105 60 L120 58 L110 70 L125 78 L105 85 L100 100 L95 85 L75 78 L90 70 L80 58 L95 60 Z" fill="#FFFFFF" />
      <path d="M140 100 Q160 80 170 90 L165 110 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M165 85 C175 75, 185 85, 175 95 C185 95, 185 105, 175 105 C180 115, 170 120, 160 110 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M60 110 Q40 130 45 150 L65 140 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M35 145 C25 155, 35 165, 45 165 C45 175, 55 175, 60 165 C70 170, 75 160, 65 150 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M80 165 L75 190 L95 190 L90 165 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M120 165 L125 190 L105 190 L110 165 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M70 190 L95 190 L95 200 L65 200 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <path d="M105 190 L130 190 L135 200 L105 200 Z" fill="#9F7FF7" stroke="#121212" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="100" cy="115" r="45" fill="#20B2AA" stroke="#121212" strokeWidth="8" />
      <circle cx="85" cy="110" r="5" fill="#121212" />
      <circle cx="115" cy="110" r="5" fill="#121212" />
      <circle cx="83" cy="108" r="1.5" fill="#FFFFFF" />
      <circle cx="113" cy="108" r="1.5" fill="#FFFFFF" />
      <path d="M95 118 Q100 125 105 118" fill="none" stroke="#121212" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Official StoreBook Logo with Bookmark/Diagonal Arrow (Matching Favicon)
function StoreBookLogo({ size = 24, fill = "#eab308", stroke = "#121212", strokeWidth = 2.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="m14 6-4 4" />
      <path d="M10 6h4v4" />
    </svg>
  );
}

// Home/Welcome Page Component
function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eab308', color: '#121212', padding: '16px', border: '3.5px solid #121212', boxShadow: '4px 4px 0px #121212', marginBottom: '20px' }}>
            <StoreBookLogo size={44} strokeWidth={2.5} fill="#eab308" stroke="#121212" />
          </div>
          <h1 className="brand-title">StoreBook</h1>
          <p className="hero-subtitle">Stationery Management System</p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <StoreBookLogo size={36} />
              <h3>Catalog Inventory</h3>
              <p>Track and organize all college stationery items</p>
            </div>
            <div className="feature-card">
              <PenTool size={36} />
              <h3>Student Requests</h3>
              <p>Submit stationery requests easily in real-time</p>
            </div>
            <div className="feature-card">
              <RefreshCcw size={36} />
              <h3>Request Tracking</h3>
              <p>Monitor request approvals and fulfillment</p>
            </div>
            <div className="feature-card">
              <ShieldCheck size={36} />
              <h3>Secure RBAC</h3>
              <p>Role-based access control for students and admins</p>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onNavigate('login')}>
              Get Started
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '24px', width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.8, cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5, transition: 'opacity 0.2s', pointerEvents: 'auto' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#121212' }}>Presented by</span>
          <DotLogo size={20} />
          <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px', color: '#121212' }}>.dot</span>
        </div>
      </div>
    </div>
  );
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// API helper function to make authenticated requests and handle responses
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

// Main App Component
function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState('catalog');

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  if (!session) {
    return showAuth ? (
      <AuthScreen onSession={setSession} />
    ) : (
      <HomePage onNavigate={(action) => {
        if (action === 'login') setShowAuth(true);
      }} />
    );
  }

  const isAdmin = session.role === 'ADMIN';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <StoreBookLogo size={24} strokeWidth={2.5} fill="#eab308" stroke="#121212" />
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
  const showToast = React.useContext(ToastContext);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address (e.g., name@college.edu)');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters');
      return;
    }
    if (mode === 'register' && !form.fullName.trim()) {
      setError('Full name required');
      return;
    }
    
    setLoading(true);
    apiFetch(`/api/auth/${mode}`, null, {
      method: 'POST',
      body: JSON.stringify(mode === 'login' ? { email: form.email.trim(), password: form.password } : { ...form, email: form.email.trim() })
    }).then(onSession).catch(err => {
      setError(err.message);
      showToast(err.message, 'error');
    }).finally(() => setLoading(false));
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
  const [sortBy, setSortBy] = useState('name');
  const showToast = React.useContext(ToastContext);
  const isAdmin = session.role === 'ADMIN';

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('stationery.deleted_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('stationery.deleted_items', JSON.stringify(deletedIds));
  }, [deletedIds]);

  function loadItems() {
    setLoading(true);
    apiFetch(`/api/items?size=20&sort=${sortBy}`, session.token)
      .then(data => setItems(data.content || []))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(loadItems, [session.token, sortBy]);

  function handleUpdate(id, data) {
    return apiFetch(`/api/items/${id}`, session.token, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    .then(updated => {
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      showToast('Item updated successfully', 'success');
    })
    .catch(err => showToast(err.message, 'error'));
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setDeletedIds(prev => [...prev, id]);
      showToast('Item deleted successfully', 'success');
    }
  }

  const visibleItems = items.filter(item => !deletedIds.includes(item.id));

  return (
    <section>
      <div className="section-title">
        <h2>Catalog</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ minHeight: '36px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="availableQuantity">Sort by Available Stock</option>
            <option value="updatedAt">Sort by Last Updated</option>
          </select>
          <button className="icon-button" title="Refresh" onClick={loadItems}>
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>
      {loading && <p>Loading inventory...</p>}
      {!loading && (
        <div className="grid">
          {visibleItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              isAdmin={isAdmin}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ItemCard({ item, isAdmin, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    unit: item.unit,
    availableQuantity: item.availableQuantity,
    minimumQuantity: item.minimumQuantity
  });
  const [loading, setLoading] = useState(false);

  function save(e) {
    e.preventDefault();
    setLoading(true);
    onUpdate(item.id, form)
      .then(() => setEditing(false))
      .finally(() => setLoading(false));
  }

  if (editing) {
    return (
      <article className="item-card">
        <form onSubmit={save} style={{ display: 'grid', gap: '8px' }}>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Item name"
            required
            disabled={loading}
          />
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            disabled={loading}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            placeholder="Unit"
            required
            disabled={loading}
          />
          <input
            type="number"
            value={form.availableQuantity}
            onChange={e => setForm({ ...form, availableQuantity: Number(e.target.value) || 0 })}
            placeholder="Available Quantity"
            required
            disabled={loading}
          />
          <input
            type="number"
            value={form.minimumQuantity}
            onChange={e => setForm({ ...form, minimumQuantity: Number(e.target.value) || 0 })}
            placeholder="Minimum Quantity"
            required
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="primary" type="submit" disabled={loading} style={{ flex: 1, height: '32px', fontSize: '13px' }}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={loading} style={{ flex: 1, height: '32px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', background: '#ccc', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="item-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge">{item.category}</span>
          {item.lowStock && <span className="badge warning">Low stock</span>}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEditing(true)} style={{ background: 'transparent', cursor: 'pointer', fontSize: '13px', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: '600' }}>Edit</button>
            <button onClick={onDelete} style={{ background: 'transparent', cursor: 'pointer', fontSize: '13px', border: 'none', padding: 0, color: 'var(--error)', fontWeight: '600' }}>Delete</button>
          </div>
        )}
      </div>
      <h3>{item.name}</h3>
      <p>Available: {item.availableQuantity} {item.unit}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '4px 0 8px 0' }}>
        Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
      </p>
      <small>Minimum level: {item.minimumQuantity} {item.unit}</small>
    </article>
  );
}

function InventoryAdmin({ session }) {
  const [form, setForm] = useState(EMPTY_ITEM_FORM);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = React.useContext(ToastContext);

  function submit(event) {
    event.preventDefault();
    setMessage('');
    
    if (!form.name.trim()) {
      showToast('Item name required', 'error');
      setMessage('Item name required');
      return;
    }
    if (form.availableQuantity < 0 || form.minimumQuantity < 0) {
      showToast('Quantities cannot be negative', 'error');
      setMessage('Quantities cannot be negative');
      return;
    }
    
    setLoading(true);
    apiFetch('/api/items', session.token, { method: 'POST', body: JSON.stringify(form) })
      .then(() => {
        showToast('Item added successfully', 'success');
        setMessage('Item added to inventory.');
        setForm(EMPTY_ITEM_FORM);
      })
      .catch(err => {
        showToast(err.message, 'error');
        setMessage(err.message);
      })
      .finally(() => setLoading(false));
  }

  const PRESETS = [
    { name: 'Pastel Highlighter Set', category: 'MARKER', unit: 'set', availableQuantity: 50, minimumQuantity: 10 },
    { name: 'Spiral Journal 200 Pages', category: 'NOTEBOOK', unit: 'piece', availableQuantity: 80, minimumQuantity: 15 },
    { name: 'Black Gel Pen Pack', category: 'PEN', unit: 'packet', availableQuantity: 120, minimumQuantity: 25 },
    { name: 'Sticky Notes Neon 100s', category: 'PAPER', unit: 'pad', availableQuantity: 200, minimumQuantity: 30 },
    { name: 'Heavy Duty Stapler Box', category: 'OTHER', unit: 'box', availableQuantity: 45, minimumQuantity: 8 },
  ];

  return (
    <section className="form-section">
      <h2>Add Stationery Item</h2>
      <div style={{ margin: '16px 0 20px', padding: '16px', background: '#f8fafc', border: '2.5px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
        <p style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>✨ Quick Add Stationery Presets:</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setForm(preset)}
              style={{ background: '#e0f2fe', color: '#0f172a', border: '2px solid #0f172a', boxShadow: '2px 2px 0px #0f172a', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>
      <form className="data-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          <input id="itemName" placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} disabled={loading}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <input id="unit" placeholder="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="availableQuantity">Available Quantity</label>
          <input id="availableQuantity" type="number" min="0" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: Number(e.target.value) || 0 })} disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="minimumQuantity">Minimum Quantity</label>
          <input id="minimumQuantity" type="number" min="0" value={form.minimumQuantity} onChange={e => setForm({ ...form, minimumQuantity: Number(e.target.value) || 0 })} disabled={loading} />
        </div>
        <div className="form-group">
          <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}><PackagePlus size={18} /> {loading ? 'Adding...' : 'Add item'}</button>
        </div>
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
  const [catalogItems, setCatalogItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = React.useContext(ToastContext);

  function load() {
    apiFetch('/api/requests/mine', session.token)
      .then(data => setRequests(data.content || []))
      .catch(err => showToast(err.message, 'error'));
  }

  useEffect(() => {
    load();
    apiFetch('/api/items?size=20&sort=name', session.token)
      .then(data => setCatalogItems(data.content || []))
      .catch(err => showToast(err.message, 'error'));
  }, [session.token]);

  function addToCart(event) {
    event.preventDefault();
    setMessage('');
    
    if (!line.itemId || !line.itemName || line.quantity < 1) {
      showToast('Item selection and quantity (min 1) required', 'error');
      setMessage('Item selection and quantity (min 1) required');
      return;
    }

    const existing = cart.find(x => String(x.itemId) === String(line.itemId));
    if (existing) {
      setCart(cart.map(x => String(x.itemId) === String(line.itemId) ? { ...x, quantity: x.quantity + Number(line.quantity) } : x));
    } else {
      setCart([...cart, { itemId: line.itemId, itemName: line.itemName, quantity: Number(line.quantity) }]);
    }
    showToast('Item added to cart', 'success');
    setLine(EMPTY_REQUEST_LINE);
  }

  function removeFromCart(itemId) {
    setCart(cart.filter(x => String(x.itemId) !== String(itemId)));
  }

  function submitRequest() {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    setLoading(true);

    const promises = cart.map(item => {
      return apiFetch('/api/requests', session.token, {
        method: 'POST',
        body: JSON.stringify({
          items: [{
            itemId: Number(item.itemId),
            itemName: item.itemName,
            quantity: Number(item.quantity)
          }]
        })
      });
    });

    Promise.all(promises)
      .then(() => {
        setCart([]);
        showToast('Requests submitted successfully', 'success');
        load();
      })
      .catch(err => {
        showToast(err.message, 'error');
      })
      .finally(() => setLoading(false));
  }

  const selectedItem = catalogItems.find(item => String(item.id) === String(line.itemId));

  return (
    <section className="split">
      <div>
        <h2>Submit Request</h2>
        <form className="data-form" onSubmit={addToCart}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="itemSelect">Item Name</label>
            <select
              id="itemSelect"
              value={line.itemId}
              onChange={e => {
                const selectedId = e.target.value;
                const item = catalogItems.find(x => String(x.id) === String(selectedId));
                if (item) {
                  setLine({ ...line, itemId: item.id, itemName: item.name });
                } else {
                  setLine({ ...line, itemId: '', itemName: '' });
                }
              }}
              disabled={loading}
            >
              <option value="">Select an item...</option>
              {catalogItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={line.quantity}
              onChange={e => setLine({ ...line, quantity: Number(e.target.value) || 1 })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              Add to Cart
            </button>
          </div>
          {selectedItem && (
            <div className="selected-item-info">
              <div><strong>Available quantity:</strong> {selectedItem.availableQuantity}</div>
              <div><strong>Unit:</strong> {selectedItem.unit}</div>
              <div><strong>Minimum quantity:</strong> {selectedItem.minimumQuantity}</div>
            </div>
          )}
        </form>
        {message && <p className="notice">{message}</p>}

        {cart.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', textAlign: 'left' }}>
            <h3>Your Cart</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map(item => (
                <li key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}>
                  <span><strong>{item.itemName}</strong> x {item.quantity}</span>
                  <button onClick={() => removeFromCart(item.itemId)} style={{ background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '13px', border: 'none', padding: 0, fontWeight: '600' }}>Remove</button>
                </li>
              ))}
            </ul>
            <button className="primary" onClick={submitRequest} disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              Submit Request ({cart.length} item{cart.length > 1 ? 's' : ''})
            </button>
          </div>
        )}
      </div>
      <RequestTable requests={requests} />
    </section>
  );
}

function AdminRequests({ session }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = React.useContext(ToastContext);

  function load() {
    setError('');
    apiFetch('/api/requests', session.token)
      .then(data => setRequests(data.content || []))
      .catch(err => {
        setError(err.message);
        showToast(err.message, 'error');
      });
  }
  
  useEffect(load, [session.token]);

  function decide(id, action) {
    setLoading(id);
    const options = action === 'reject'
      ? { method: 'POST', body: JSON.stringify({ reason: 'Not approved by stores office' }) }
      : { method: 'POST' };
    apiFetch(`/api/requests/${id}/${action}`, session.token, options)
      .then(() => {
        const msg = action === 'approve' ? 'Request approved successfully' : 'Request rejected successfully';
        showToast(msg, 'success');
        load();
      })
      .catch(err => {
        setError(err.message);
        showToast(err.message, 'error');
      })
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
        <thead>
          <tr>
            {admin && <th>ID</th>}
            <th>Student</th>
            <th>Status</th>
            <th>Items</th>
            {admin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              {admin && <td>#{request.id || '-'}</td>}
              <td>{request.studentEmail}</td>
              <td><span className={`status ${request.status.toLowerCase()}`}>{request.status}</span></td>
              <td>{request.items?.map(item => `${item.itemName} x${item.quantity}`).join(', ') || '-'}</td>
              {admin && request.status === 'PENDING' && (
                <td className="actions">
                  <button className="btn-approve" onClick={() => onApprove(request.id)}><Check size={15} /> Approve</button>
                  <button className="btn-reject" onClick={() => onReject(request.id)}><X size={15} /> Reject</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>
);
