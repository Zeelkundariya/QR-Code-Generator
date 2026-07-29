# QR Code Generator Web Application

A modern, full-stack web application for generating highly customizable Static and Dynamic QR Codes.

## Architecture

- **Frontend**: Built with React (Vite) and styled with Vanilla CSS (Glassmorphism & Dark Mode).
- **Backend**: Built with FastAPI (Python) for ultra-fast QR generation and short-link redirects.
- **Database**: SQLite for storing dynamic QR code mapping.

## Features

- **Static QR Codes**: Standard URL encoding.
- **Dynamic QR Codes**: Short-link redirects that can be updated (coming soon: dashboard to update links!).
- **Center Logos**: Upload and embed custom logos into the center of the QR code.
- **Custom Colors**: Choose from curated high-contrast color palettes.
- **Radial Gradients**: Apply stunning radial gradients instead of flat fills.

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs on `http://localhost:8000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.
