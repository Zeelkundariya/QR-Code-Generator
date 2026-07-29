# Premium QR Code Generator (SaaS-Ready)

A modern, full-stack, enterprise-grade web application for generating highly customizable Static and Dynamic QR Codes. Built to scale with advanced analytics, custom shapes, bulk generation, and link management.

## 🏗️ Architecture

- **Frontend:** Built with React (Vite) and styled with custom Vanilla CSS featuring a premium Dark Mode & Glassmorphism aesthetic.
- **Backend:** Built with FastAPI (Python) for ultra-fast QR generation, short-link redirects, and async GeoIP resolution.
- **Database:** SQLite handles dynamic QR code mappings, analytics telemetry, and security constraints.

## ✨ Features

### QR Customization
- **Multiple Formats:** Export to high-resolution PNG or vector SVG.
- **Custom Shapes:** Choose from Classic Square, Rounded Edges, Circular Dots, or Gapped Dots.
- **Color Themes:** 10 curated high-contrast professional color palettes.
- **Stunning Gradients:** Apply beautiful radial gradients instead of flat fills.
- **Branding:** Upload and embed custom center logos into your QR codes.

### Dynamic Links & Analytics
- **Dynamic QR Codes:** Generate short links that can be redirected or updated at any time from the Dashboard without changing the physical QR code.
- **Advanced Dashboard Analytics:** Track total scans, device types (Mobile vs. Desktop), and top geographical regions (Country & City).
- **Security & Limits:** Enforce password protection, set maximum scan limits, or schedule expiration dates for dynamic links.

### Bulk Operations
- **Bulk Generation:** Upload a `.csv` file with hundreds of URLs to generate a `.zip` archive containing all your QR codes in seconds.

## 🚀 Getting Started

### Backend
Navigate to the `backend` directory, install the Python dependencies, and start the FastAPI server:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
The backend API runs at `http://localhost:8000`.

### Frontend
Navigate to the `frontend` directory, install the Node modules, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The React frontend runs at `http://localhost:5174`.
