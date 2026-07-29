from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import RadialGradiantColorMask, SolidFillColorMask
from PIL import Image
import io
import base64
import sqlite3
import string
import random
from typing import Optional

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
                 (short_id TEXT PRIMARY KEY, url TEXT)''')
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the QR Code Generator API"}

from fastapi.responses import RedirectResponse

@app.get("/r/{short_id}")
def redirect_to_url(short_id: str):
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("SELECT url FROM links WHERE short_id = ?", (short_id,))
    result = c.fetchone()
    conn.close()
    if result:
        return RedirectResponse(url=result[0])
    raise HTTPException(status_code=404, detail="Link not found")

@app.get("/api/links")
def get_links():
    conn = sqlite3.connect('qr.db')
    c = conn.cursor()
    c.execute("SELECT short_id, url FROM links")
    results = [{"short_id": row[0], "url": row[1]} for row in c.fetchall()]
    conn.close()
    return {"links": results}

@app.post("/api/generate")
def generate_qr(request: QRRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    qr_url = request.url
    
    if request.is_dynamic:
        short_id = generate_short_id()
        conn = sqlite3.connect('qr.db')
        c = conn.cursor()
        c.execute("INSERT INTO links (short_id, url) VALUES (?, ?)", (short_id, request.url))
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
