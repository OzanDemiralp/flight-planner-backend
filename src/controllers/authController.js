import bcrypt from 'bcrypt';
import passport from 'passport';
import User from '../models/user.js';

export async function register(req, res) {
  const { email, password } = req.body;

  const normalizedEmail = String(email || '')
    .toLowerCase()
    .trim();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: normalizedEmail, passwordHash });

  res.status(201).json({ id: user._id, email: user.email });
}

export function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: info?.message ?? 'Unauthorized' });

    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      return res.json({ id: user._id, email: user.email });
    });
  })(req, res, next);
}

export function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie('fp.sid');
      res.json({ ok: true });
    });
  });
}

export function me(req, res) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user);
}
