import { Router } from 'express';
import multer from 'multer';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { sendOtpEmail, isMailConfigured } from '../lib/mail.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AVATARS_DIR = join(__dirname, '..', 'uploads', 'avatars');

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
  },
});

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email?.trim() || !password?.trim() || !name?.trim()) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hash,
      name: name.trim(),
    });
    const token = signToken({ id: user._id.toString(), email: user.email });
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken({ id: user._id.toString(), email: user.email });
  return res.json({ user: user.toJSON(), token });
});

// Forgot password: send OTP to email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!isMailConfigured()) {
    return res.status(503).json({ error: 'Email service is not configured' });
  }
  const emailNorm = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailNorm });
  if (!user) {
    return res.json({ message: 'If an account exists, you will receive an OTP shortly.' });
  }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await Otp.findOneAndUpdate(
    { email: emailNorm },
    { otp, expiresAt },
    { upsert: true, new: true }
  );
  try {
    await sendOtpEmail(emailNorm, otp);
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to send OTP email' });
  }
  return res.json({ message: 'If an account exists, you will receive an OTP shortly.' });
});

// Reset password: verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const emailNorm = email.trim().toLowerCase();
  const record = await Otp.findOne({ email: emailNorm });
  if (!record || record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  if (new Date() > record.expiresAt) {
    await Otp.deleteOne({ email: emailNorm });
    return res.status(400).json({ error: 'OTP has expired' });
  }
  const user = await User.findOne({ email: emailNorm }).select('+password');
  if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });
  user.password = bcrypt.hashSync(newPassword, 10);
  await user.save();
  await Otp.deleteOne({ email: emailNorm });
  return res.json({ message: 'Password reset successfully' });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json(user.toJSON());
});

// Update profile (name, about, city)
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, about, city } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (name !== undefined) user.name = String(name).trim() || user.name;
  if (about !== undefined) user.about = String(about).trim();
  if (city !== undefined) user.city = String(city).trim();
  await user.save();
  return res.json(user.toJSON());
});

// Upload profile image (auth required)
router.post('/profile/avatar', authMiddleware, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image too large (max 5 MB)' });
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    await mkdir(AVATARS_DIR, { recursive: true });
    const ext = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${user._id.toString()}.${ext}`;
    const filePath = join(AVATARS_DIR, filename);
    await writeFile(filePath, req.file.buffer);
    user.profileImage = filename;
    await user.save();
    return res.json(user.toJSON());
  });
});

export default router;
