import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ClipboardList, LogOut, PackagePlus, RefreshCcw, Send, ShieldCheck, X, Edit, Trash2 } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const STORAGE_KEY = 'stationery.session';
const CATEGORIES = ['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'MARKER', 'FILE', 'ERASER', 'OTHER'];
const DEFAULT_ADMIN_CREDS = { fullName: '', email: 'admin@college.edu', password: 'Admin@123', role: 'ADMIN' };
const DEFAULT_STUDENT_CREDS = { fullName: '', email: '', password: '', role: 'STUDENT' };
const EMPTY_ITEM_FORM = { name: '', category: 'PEN', unit: 'piece', availableQuantity: 0, minimumQuantity: 0 };
const EMPTY_REQUEST_LINE = { itemId: '', itemName: '', quantity: 1 };

const ToastContext = React.createContext(null);

// Home/Welcome Page Component
function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="hero-content">
          <h1>Stationery Management System</h1>
          <p className="hero-subtitle">Manage your college stationery inventory efficiently</p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <PackagePlus size={32} />
              <h3>Manage Items</h3>
              <p>Track and organize all stationery items</p>
            </div>
            <div className="feature-card">
              <ClipboardList size={32} />
              <h3>Create Requests</h3>
              <p>Submit stationery requests easily</p>
            </div>
            <div className="feature-card">
              <RefreshCcw size={32} />
              <h3>Track Status</h3>
              <p>Monitor request approvals in real-time</p>
            </div>
            <div className="feature-card">
              <ShieldCheck size={32} />
              <h3>Secure Access</h3>
              <p>Role-based access control</p>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onNavigate('login')}>
              Get Started
            </button>
          </div>
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
    if (mode === 'register' && !form.fullName) {
      setError('Full name required');
      return;
    }
    
    setLoading(true);
    apiFetch(`/api/auth/${mode}`, null, {
      method: 'POST',
      body: JSON.stringify(mode === 'login' ? { email: form.email, password: form.password } : form)
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

  return (
    <section className="form-section">
      <h2>Add Stationery Item</h2>
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
