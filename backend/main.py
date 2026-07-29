from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse, Response
from pydantic import BaseModel
import urllib.parse
from pydantic import BaseModel
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import RadialGradiantColorMask, SolidFillColorMask
import qrcode.image.svg
from PIL import Image
import io
import base64
import sqlite3
import string
import random
from typing import Optional
import csv
import zipfile

app = FastAPI(title="QR Code Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS links
                 (short_id TEXT PRIMARY KEY, url TEXT, scans INTEGER DEFAULT 0, password TEXT)''')
    try:
        c.execute("ALTER TABLE links ADD COLUMN scans INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE links ADD COLUMN password TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

init_db()

def generate_short_id(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class QRRequest(BaseModel):
    url: str
    fill_color: str = "#000000"
    bg_color: str = "#FFFFFF"
    use_gradient: bool = False
    logo_base64: Optional[str] = None
    is_dynamic: bool = False
    password: Optional[str] = None
    format: str = "png"

@app.get("/")
def read_root():
    return {"message": "Welcome to the QR Code Generator API"}

from fastapi.responses import RedirectResponse

@app.get("/r/{short_id}")
def redirect_to_url(short_id: str):
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("SELECT url, password FROM links WHERE short_id = ?", (short_id,))
    result = c.fetchone()
    if result:
        url, password = result
        if password:
            conn.close()
            return HTMLResponse(content=f"""
                <html>
                    <head>
                        <title>Protected Link</title>
                        <style>
                            body {{ font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a1a; color: white; }}
                            .card {{ background: #2a2a2a; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center; }}
                            input {{ padding: 0.5rem; margin-top: 1rem; border-radius: 4px; border: none; width: 100%; box-sizing: border-box; }}
                            button {{ background: #007bff; color: white; border: none; padding: 0.5rem 1rem; margin-top: 1rem; border-radius: 4px; cursor: pointer; width: 100%; }}
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>Password Protected</h2>
                            <p>This QR code link is protected.</p>
                            <form action="/r/{short_id}/unlock" method="POST">
                                <input type="password" name="password" placeholder="Enter password" required />
                                <button type="submit">Unlock</button>
                            </form>
                        </div>
                    </body>
                </html>
            """)
        
        c.execute("UPDATE links SET scans = scans + 1 WHERE short_id = ?", (short_id,))
        conn.commit()
        conn.close()
        return RedirectResponse(url=url)
    conn.close()
    return HTMLResponse(status_code=404, content="""
        <html>
            <head>
                <title>Link Not Found</title>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
                    .card { background: rgba(30, 41, 59, 0.7); padding: 3rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
                    h1 { color: #ef4444; margin-top: 0; }
                    p { color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>404</h1>
                    <p>Oops! The link you are looking for does not exist or has been removed.</p>
                </div>
            </body>
        </html>
    """)

@app.post("/r/{short_id}/unlock")
def unlock_url(short_id: str, password: str = Form(...)):
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("SELECT url, password FROM links WHERE short_id = ?", (short_id,))
    result = c.fetchone()
    if result:
        url, saved_password = result
        if password == saved_password:
            c.execute("UPDATE links SET scans = scans + 1 WHERE short_id = ?", (short_id,))
            conn.commit()
            conn.close()
            return RedirectResponse(url=url, status_code=303)
        conn.close()
        return HTMLResponse(content="<h2>Incorrect password. <a href='/r/" + short_id + "'>Try again</a></h2>")
    conn.close()
    conn.close()
    return HTMLResponse(status_code=404, content="""
        <html>
            <head>
                <title>Link Not Found</title>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
                    .card { background: rgba(30, 41, 59, 0.7); padding: 3rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
                    h1 { color: #ef4444; margin-top: 0; }
                    p { color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>404</h1>
                    <p>Oops! The link you are looking for does not exist or has been removed.</p>
                </div>
            </body>
        </html>
    """)

@app.get("/api/links")
def get_links():
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("SELECT short_id, url, scans FROM links")
    results = [{"short_id": row[0], "url": row[1], "scans": row[2] if len(row)>2 else 0} for row in c.fetchall()]
    conn.close()
    return {"links": results}

class UpdateLinkRequest(BaseModel):
    url: str

@app.put("/api/links/{short_id}")
def update_link(short_id: str, request: UpdateLinkRequest):
    parsed = urllib.parse.urlparse(request.url)
    if not parsed.scheme or parsed.scheme not in ['http', 'https']:
        raise HTTPException(status_code=400, detail="Invalid URL format. Must start with http:// or https://")
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("UPDATE links SET url = ? WHERE short_id = ?", (request.url, short_id))
    conn.commit()
    conn.close()
    return {"message": "Link updated successfully"}

@app.post("/api/generate")
def generate_qr(request: QRRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    parsed = urllib.parse.urlparse(request.url)
    if not parsed.scheme or parsed.scheme not in ['http', 'https']:
        raise HTTPException(status_code=400, detail="Invalid URL format. Must start with http:// or https://")

    qr_url = request.url
    
    if request.is_dynamic:
        short_id = generate_short_id()
        conn = sqlite3.connect('qr.db')
        c = conn.cursor()
        c.execute("INSERT INTO links (short_id, url, password) VALUES (?, ?, ?)", (short_id, request.url, request.password))
        conn.commit()
        conn.close()
        # Assume the backend is hosted here
        qr_url = f"http://localhost:8000/r/{short_id}"
        
    qr = qrcode.QRCode(
        version=4,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    if request.format == "svg":
        factory = qrcode.image.svg.SvgPathImage
        img_svg = qr.make_image(image_factory=factory)
        img_buffer = io.BytesIO()
        img_svg.save(img_buffer)
        encoded_img = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        return {"image": f"data:image/svg+xml;base64,{encoded_img}"}
        
    def hex_to_rgb(h):
        h = h.lstrip('#')
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
        
    bg_rgb = hex_to_rgb(request.bg_color)
    fill_rgb = hex_to_rgb(request.fill_color)

    if request.use_gradient:
        color_mask = RadialGradiantColorMask(back_color=bg_rgb, center_color=fill_rgb, edge_color=(0,0,0))
    else:
        color_mask = SolidFillColorMask(back_color=bg_rgb, front_color=fill_rgb)
        
    img = qr.make_image(
        image_factory=StyledPilImage,
        color_mask=color_mask
    )
    
    img = img.convert("RGBA")
    
    if request.logo_base64:
        try:
            logo_data = base64.b64decode(request.logo_base64.split(",")[1] if "," in request.logo_base64 else request.logo_base64)
            logo = Image.open(io.BytesIO(logo_data)).convert("RGBA")
            
            basewidth = int(float(img.size[0]) * 0.2)
            wpercent = (basewidth / float(logo.size[0]))
            hsize = int((float(logo.size[1]) * float(wpercent)))
            logo = logo.resize((basewidth, hsize), Image.Resampling.LANCZOS)
            
            pos = ((img.size[0] - logo.size[0]) // 2, (img.size[1] - logo.size[1]) // 2)
            img.paste(logo, pos, mask=logo)
        except Exception as e:
            print(f"Failed to add logo: {e}")
    
    img_buffer = io.BytesIO()
    img.save(img_buffer, format="PNG")
    img_bytes = img_buffer.getvalue()
    
    encoded_img = base64.b64encode(img_bytes).decode('utf-8')
    return {"image": f"data:image/png;base64,{encoded_img}"}

@app.post("/api/bulk-generate")
async def bulk_generate(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be a CSV file")
        
    content = await file.read()
    decoded = content.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(decoded))
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, row in enumerate(csv_reader):
            if not row or not row[0].strip():
                continue
            url = row[0].strip()
            
            parsed = urllib.parse.urlparse(url)
            if not parsed.scheme or parsed.scheme not in ['http', 'https']:
                continue # Skip invalid URLs in bulk
                
            qr = qrcode.QRCode(version=4, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
            qr.add_data(url)
            qr.make(fit=True)
            
            img = qr.make_image(image_factory=StyledPilImage, color_mask=SolidFillColorMask(back_color=(255,255,255), front_color=(0,0,0)))
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            
            zip_file.writestr(f"qr_code_{i+1}.png", img_buffer.getvalue())
            
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=bulk_qr_codes.zip"}
    )
