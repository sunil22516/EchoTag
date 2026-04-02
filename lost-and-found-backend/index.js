require('dotenv').config(); // Add this line at the top

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const session = require('express-session'); // Add this line

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
 // Allow requests from frontend

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://lostandfound-qr-default-rtdb.firebaseio.com/',
});
const db = admin.firestore();

// Configure Multer for file uploads (for photos)
const upload = multer({ dest: 'uploads/' });

// Configure express-session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ----- OAuth Setup using Passport with Google -----
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', profile.emails[0].value).get();
      let user;
      if (snapshot.empty) {
        // Create new user document if not exists
        const newUser = {
          name: profile.displayName,
          email: profile.emails[0].value,
          phone: '', // optional
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await usersRef.add(newUser);
        user = { id: docRef.id, ...newUser };
      } else {
        const doc = snapshot.docs[0];
        user = { id: doc.id, ...doc.data() };
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user into the sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
  try {
    const userDoc = await db.collection('users').doc(id).get();
    if (userDoc.exists) {
      done(null, { id: userDoc.id, ...userDoc.data() });
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

// ----- Routes for OAuth Authentication -----
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // On success, redirect to your frontend dashboard or another page.
    res.redirect('http://localhost:3001/dashboard'); // adjust as needed
  }
);

// ----- API Endpoints -----

app.post('/users/register', async (req, res) => {
  const { name, email, password, phone} = req.body;
  try {
    // Your logic to register the user, e.g., saving to Firestore
    const userRef = await db.collection('users').add({ name, email, password, phone});
    res.status(201).send({ userId: userRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 1. Item Registration with Photo Upload & QR Code Generation
app.post('/items/register', upload.single('photo'), async (req, res) => {
  const { itemName, description, ownerId } = req.body;
  try {
    const itemRef = db.collection('items').doc();
    const itemId = itemRef.id;

    // Optionally process the uploaded photo (stored in req.file.path)
    // For simplicity, assume you store the file path or upload to a cloud storage
    const photoUrl = req.file ? req.file.path : '';

    // Generate QR Code URL (link to a secure page or item details page)
    const qrData = `https://your-frontend-url.com/items/${itemId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Save item data in Firestore
    await itemRef.set({
      itemName,
      description,
      photoUrl,
      ownerId,
      qrCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).send({ itemId, qrCode });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 2. QR Code Scanning: Lookup item info and send notification
app.post('/items/scan', async (req, res) => {
  const { itemId } = req.body;
  try {
    const itemDoc = await db.collection('items').doc(itemId).get();
    if (!itemDoc.exists) {
      return res.status(404).send({ error: 'Item not found.' });
    }
    const itemData = itemDoc.data();
    const ownerDoc = await db.collection('users').doc(itemData.ownerId).get();
    if (!ownerDoc.exists) {
      return res.status(404).send({ error: 'Owner not found.' });
    }
    const ownerData = ownerDoc.data();

    // Send notification (example using nodemailer for email)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerData.email,
      subject: 'Your Item Has Been Scanned!',
      text: `Your item "${itemData.itemName}" has been scanned. Please check your dashboard for details.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // For push notifications, integrate Firebase Cloud Messaging here.

    res.status(200).send({ message: 'Owner notified successfully.', itemDetails: itemData });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 3. Found Item Reporting (manual reporting for items without QR codes)
app.post('/items/report', upload.single('photo'), async (req, res) => {
  const { description, reporterEmail } = req.body;
  try {
    const reportRef = db.collection('reports').doc();
    const photoUrl = req.file ? req.file.path : '';
    await reportRef.set({
      description,
      reporterEmail,
      photoUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      verified: false,  // For admin verification
    });
    res.status(201).send({ reportId: reportRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 4. Admin Endpoints (Example: Get All Items for Dashboard)
app.get('/admin/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// (Additional endpoints for location heatmap, engagement logs, and analytics would follow a similar pattern.)

// ----- Start the Server -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});