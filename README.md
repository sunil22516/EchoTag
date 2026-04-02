# EchoTag

EchoTag is a QR-based lost and found system that helps users recover lost items by linking them to a digital identity and notification workflow.

## Overview

Users can generate a unique QR code for their belongings. When a lost item is found, scanning the QR code allows the finder to notify the owner securely without exposing personal details.

## Features

- QR code generation for items
- Google OAuth authentication
- Firebase-based user and item storage
- Image upload support
- Email notifications using Nodemailer
- REST API for item management

## Tech Stack

- Node.js, Express
- Firebase Firestore
- Passport.js (Google OAuth)
- Multer (file uploads)
- Nodemailer
- QRCode library

## How It Works

1. User logs in via Google
2. Registers an item with details
3. System generates a QR code for the item
4. Finder scans QR code
5. Owner receives notification

## Installation

```bash
git clone https://github.com/sunil22516/EchoTag.git
cd EchoTag/lost-and-found-backend
npm install
