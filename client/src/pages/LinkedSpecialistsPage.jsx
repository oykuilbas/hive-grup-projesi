import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import './m2.css';

const TYPES = ['teacher', 'psychologist', 'doctor', 'special education teacher', 'coach'];

export default function LinkedSpecialistsPage() {
  const { childId } = useParams();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const loadVersion = useRef(0);
  const currentChildId = useRef(childId);
  currentChildId.current = childId;

  async function load() {
    if (currentChildId.current !== childId) return;
    const version = ++loadVersion.current;
    setLinks([]);
    if (!childId) { setError('Choose a child to view linked specialists.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/children/${encodeURIComponent(childId)}/links`);
      if (version === loadVersion.current && currentChildId.current === childId) setLinks(data);
    } catch (err) { if (version === loadVersion.current && currentChildId.current === childId) setError(err.message); }
    finally { if (version === loadVersion.current && currentChildId.current === childId) setLoading(false); }
  }

  useEffect(() => {
    setActionError('');
    load();
    return () => { loadVersion.current += 1; };
  }, [childId]);

  async function addLink(event) {
    event.preventDefault();
    setBusy(true);
    setActionError('');
    try {
      await api.post(`/children/${encodeURIComponent(childId)}/links`, { email, specialist_type: type });
      setEmail('');
      if (currentChildId.current === childId) await load();
    } catch (err) { if (currentChildId.current === childId) setActionError(err.message); }
    finally { setBusy(false); }
  }

  async function unlink(specialist) {
    if (!window.confirm(`Unlink ${specialist.name}?`)) return;
    setBusy(true);
    setActionError('');
    try {
      await api.delete(`/children/${encodeURIComponent(childId)}/links/${specialist.specialist_id}`);
      if (currentChildId.current === childId) await load();
    } catch (err) { if (currentChildId.current === childId) setActionError(err.message); }
    finally { setBusy(false); }
  }

  return <section className="card">
    <Link className="m2-back" to="/parent">← Your children</Link>
    <h1>Linked specialists</h1>
    {loading && <p>Loading specialists...</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}
    {!loading && !error && links.length === 0 && <p>No specialists are linked to this child yet.</p>}
    {!loading && !error && links.length > 0 && <ul className="m2-list">{links.map((link) => <li key={link.id}>
      <span className="m2-link-details">
        <strong>{link.name}</strong>
        <span>{link.email}</span>
        <span className="muted">{link.specialist_type || 'Type not recorded'}</span>
      </span>
      <button type="button" disabled={busy} onClick={() => unlink(link)}>Unlink</button>
    </li>)}</ul>}
    {childId && <form className="m2-form" onSubmit={addLink}>
      <h2>Link a specialist</h2>
      <label>Email <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>{' '}
      <label>Type <select value={type} onChange={(event) => setType(event.target.value)}>
        {TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>{' '}
      <button className="primary" type="submit" disabled={busy}>Link specialist</button>
    </form>}
  </section>;
}
