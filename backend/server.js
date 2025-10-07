const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();  
app.use(cors());
app.use(express.json());

// allow forcing a dev fallback mode by setting SKIP_MONGO=1 (useful for local dev when .env exists)
if (process.env.SKIP_MONGO === '1' || process.env.SKIP_MONGO === 'true') {
  console.log('SKIP_MONGO set — running in dev fallback mode (no MongoDB).');
} else if (process.env.MONGO_URI) {
  // connect to MongoDB only when MONGO_URI is provided and SKIP_MONGO not set
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI provided — running in dev fallback mode (no MongoDB).');
}

// test route
app.get("/", (req, res) => {
  res.send("WorkConnect backend running");
});

// profile routes
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// uploads route & static serving
const uploadRoutes = require('./routes/upload');
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// verification (send/verify codes)
const verifyRoutes = require('./routes/verify');
app.use('/api/verify', verifyRoutes);

// auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// login route
const loginRoutes = require('./routes/login');
app.use('/api/auth', loginRoutes);

// status route
const statusRoutes = require('./routes/status');
app.use('/api/status', statusRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// debug: print registered routes
function listRegisteredRoutes() {
  try {
    const routes = [];
    if (!app._router || !app._router.stack) return console.log('No routes registered yet');
    app._router.stack.forEach(mw => {
      if (mw.route && mw.route.path) {
        const methods = Object.keys(mw.route.methods).map(m => m.toUpperCase()).join(',');
        routes.push(`${methods} ${mw.route.path}`);
      } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
        mw.handle.stack.forEach(r => {
          if (r.route && r.route.path) {
            const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',');
            routes.push(`${methods} ${r.route.path}`);
          }
        });
      }
    });
    console.log('Registered routes:\n' + routes.join('\n'));
  } catch (e) {
    console.error('Could not list routes', e);
  }
}
listRegisteredRoutes();