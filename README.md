# ⚽ MatchPlay

Plataforma web para encontrar y unirse a partidos de fútbol con desconocidos.

## Stack
- **Frontend:** HTML + CSS + JavaScript Vanilla
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB
- **Chat tiempo real:** Socket.IO
- **Mapa:** Leaflet.js + OpenStreetMap (gratis)
- **Email:** Nodemailer
- **WhatsApp:** Twilio

---

## 🚀 Instalación

### 1. Clonar / descomprimir el proyecto
```bash
cd matchplay
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 5. Servir el frontend
Podés usar cualquier servidor estático. Opciones:
```bash
# Con Live Server (VS Code extension) — abrís index.html
# Con Python
cd frontend && python3 -m http.server 3000
# Con Node
npx serve frontend -p 3000
```

---

## 📁 Estructura del proyecto
```
matchplay/
├── backend/
│   ├── config/         → Conexión a MongoDB
│   ├── models/         → Modelos de datos (User, Match, Rating, Comment, Message)
│   ├── routes/         → Endpoints de la API
│   ├── middleware/      → Auth JWT, rate limiter
│   ├── services/       → Email (Nodemailer) y WhatsApp (Twilio)
│   ├── server.js       → Servidor principal + Socket.IO
│   ├── .env.example    → Variables de entorno a configurar
│   └── package.json
└── frontend/
    ├── css/styles.css  → Estilos completos (tema "Stadium Night")
    ├── js/api.js       → Cliente API + utilidades
    ├── index.html      → Landing page
    ├── login.html      → Iniciar sesión
    ├── register.html   → Registro
    ├── matches.html    → Listado y mapa de partidos
    ├── create-match.html → Crear partido
    ├── match-detail.html → Detalle del partido (chat, jugadores, calificaciones)
    ├── dashboard.html  → Mis partidos
    └── profile.html    → Perfil de usuario
```

---

## 🔧 Configuración de servicios externos

### Email (Gmail)
1. Activá "Verificación en 2 pasos" en tu cuenta Google
2. Generá una "App password" en myaccount.google.com/apppasswords
3. Usá esa contraseña en `EMAIL_PASS`

### WhatsApp (Twilio)
1. Creá cuenta en twilio.com
2. Activá el sandbox de WhatsApp en la consola
3. Copiá `ACCOUNT_SID` y `AUTH_TOKEN`
4. Los usuarios deben enviar "join [código]" al número del sandbox

---

## 🗄️ Modelos de datos

| Colección | Descripción |
|---|---|
| `users` | Usuarios con perfil, nivel, posición, rating |
| `matches` | Partidos con jugadores, ubicación, estado |
| `ratings` | Calificaciones post-partido (puntualidad, fairplay, actitud) |
| `comments` | Comentarios en partidos y perfiles |
| `messages` | Mensajes del chat interno de cada partido |

---

## 🛡️ Seguridad implementada
- ✅ Contraseñas hasheadas con **bcrypt** (salt 12)
- ✅ Autenticación **JWT** + refresh tokens
- ✅ **Rate limiting** en endpoints de auth (10 req/15min)
- ✅ **Helmet** (headers de seguridad)
- ✅ **XSS** sanitización en comentarios y mensajes
- ✅ Validación de inputs con **express-validator**
- ✅ CORS configurado
- ✅ Variables de entorno para credenciales

---

## 🎮 Funcionalidades

### Usuarios
- Registro/login con verificación por email
- Perfil con foto, bio, posición, nivel, historial
- Sistema de reputación (puntualidad, fair play, actitud)
- Notificaciones por email y WhatsApp

### Partidos
- Crear partido con mapa interactivo (OpenStreetMap)
- Unirse enviando solicitud
- Organizer acepta/rechaza/expulsa jugadores
- Chat interno exclusivo para participantes confirmados
- Estados: abierto → completo/cancelado → jugado
- Calificaciones post-partido

### Búsqueda
- Filtros por nivel, formato, fecha, estado
- Vista de lista y vista de mapa

---

Desarrollado con ❤️ y ⚽ usando MatchPlay
