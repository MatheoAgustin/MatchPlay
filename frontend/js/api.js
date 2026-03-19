// ===== API CLIENT =====
const API_BASE = 'http://localhost:5000/api';

const api = {
  getToken:    () => localStorage.getItem('mp_token'),
  getUser:     () => { try { return JSON.parse(localStorage.getItem('mp_user')); } catch { return null; } },
  setAuth: (token, refreshToken, user) => {
    localStorage.setItem('mp_token', token);
    localStorage.setItem('mp_refresh', refreshToken);
    localStorage.setItem('mp_user', JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_refresh');
    localStorage.removeItem('mp_user');
  },
  isLoggedIn: () => !!localStorage.getItem('mp_token'),

  request: async (method, endpoint, data = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = api.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const config = { method, headers };
    if (data && method !== 'GET') config.body = JSON.stringify(data);
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (res.status === 401 && localStorage.getItem('mp_refresh')) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: localStorage.getItem('mp_refresh') })
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('mp_token', refreshData.token);
          headers['Authorization'] = `Bearer ${refreshData.token}`;
          const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...config, headers });
          return retryRes.json();
        }
      } catch {}
      api.clearAuth();
      window.location.href = 'index.html';
    }
    return res.json();
  },

  // Request con FormData (para subir archivos)
  requestForm: async (method, endpoint, formData) => {
    const headers = {};
    const token = api.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { method, headers, body: formData });
    return res.json();
  },

  get:    (endpoint)       => api.request('GET', endpoint),
  post:   (endpoint, data) => api.request('POST', endpoint, data),
  put:    (endpoint, data) => api.request('PUT', endpoint, data),
  delete: (endpoint)       => api.request('DELETE', endpoint),

  // Auth
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),

  // Matches
  getMatches: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return api.get(`/matches?${q}`);
  },
  getMatch:     (id)                   => api.get(`/matches/${id}`),
  createMatch:  (data)                 => api.post('/matches', data),
  joinMatch:    (id, position)         => api.post(`/matches/${id}/join`, { position }),
  cancelMatch:  (id)                   => api.put(`/matches/${id}/cancel`),
  closeMatch:   (id)                   => api.put(`/matches/${id}/close`),
  playedMatch:  (id)                   => api.put(`/matches/${id}/played`),
  managePlayer: (matchId, playerId, action) => api.put(`/matches/${matchId}/players/${playerId}`, { action }),
  myOrganized:  ()                     => api.get('/matches/my/organized'),
  myJoined:     ()                     => api.get('/matches/my/joined'),

  // Users  ← RENOMBRADO: getUserById para no pisar getUser local
  getUserById:    (id)    => api.get(`/users/${id}`),
  updateProfile:  (data)  => api.put('/users/me', data),
  uploadAvatar:   (formData) => api.requestForm('POST', '/users/me/avatar', formData),
  reportUser:     (id)    => api.post(`/users/${id}/report`),

  // Comments
  getComments:  (type, id) => api.get(`/comments?targetType=${type}&targetId=${id}`),
  postComment:  (data)     => api.post('/comments', data),
  deleteComment: (id)      => api.delete(`/comments/${id}`),

  // Messages
  getMessages:  (matchId)          => api.get(`/messages/${matchId}`),
  sendMessage:  (matchId, content) => api.post(`/messages/${matchId}`, { content }),

  // Ratings
  submitRating:        (data)    => api.post('/ratings', data),
  getMyRatingsForMatch: (matchId) => api.get(`/ratings/match/${matchId}`),
};

// ===== TOAST =====
const toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 4000) {
    this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
  success: (msg) => toast.show(msg, 'success'),
  error:   (msg) => toast.show(msg, 'error'),
  info:    (msg) => toast.show(msg, 'info'),
};

// ===== UTILS =====
const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const formatDateShort = (d) =>
  new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

const formatDateFull = (d) =>
  new Date(d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusBadge = (status) => {
  const map = { open: ['Abierto','badge-open'], full: ['Completo','badge-full'], cancelled: ['Cancelado','badge-cancelled'], played: ['Jugado','badge-played'] };
  const [label, cls] = map[status] || ['Desconocido',''];
  return `<span class="badge ${cls}">${label}</span>`;
};

const levelBadge = (level) => {
  const cls = level?.toLowerCase() || 'todos';
  return `<span class="badge badge-${cls}">${level || 'Todos'}</span>`;
};

const avatarInitials = (name = '?') => {
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const avatarHtml = (src, name, size = 40) => {
  if (src) return `<img src="${src}" alt="${name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  const colors = ['#56ab2f','#ffd740','#40c4ff','#ff7043','#ce93d8'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size*0.35)}px;color:${color};">${avatarInitials(name)}</div>`;
};

const starsHtml = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    stars.push(`<span class="star ${filled ? 'filled' : ''}" data-val="${i}">${filled ? '★' : '☆'}</span>`);
  }
  return `<div class="stars">${stars.join('')}</div>`;
};

// ===== NAVBAR =====
function initNavbar() {
  const user = api.getUser(); // ← Lee de localStorage (correcto)
  const nav    = document.getElementById('navbar-links');
  const toggle = document.getElementById('mobile-toggle');

  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
  if (!nav) return;

  if (user) {
    const page = window.location.pathname.split('/').pop();
    nav.innerHTML = `
      <a href="matches.html"      class="${page==='matches.html'?'active':''}">⚽ Partidos</a>
      <a href="create-match.html" class="${page==='create-match.html'?'active':''}">＋ Crear partido</a>
      <a href="dashboard.html"    class="${page==='dashboard.html'?'active':''}">📋 Mis partidos</a>
      <a href="profile.html?id=${user._id}" class="${page==='profile.html'?'active':''}">👤 Mi perfil</a>
      <a href="#" id="logout-btn" style="color:var(--text-muted);">Salir</a>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault(); api.clearAuth(); window.location.href = 'index.html';
    });
  } else {
    nav.innerHTML = `
      <a href="matches.html">⚽ Partidos</a>
      <a href="index.html" class="btn btn-outline btn-sm">Iniciar sesión</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initNavbar);
