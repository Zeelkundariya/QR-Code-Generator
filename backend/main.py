from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import RadialGradiantColorMask, SolidFillColorMask
import io
import base64

app = FastAPI(title="QR Code Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QRRequest(BaseModel):
    url: str
    fill_color: str = "#000000"
    bg_color: str = "#FFFFFF"
    use_gradient: bool = False

@app.get("/")
def read_root():
    return {"message": "Welcome to the QR Code Generator API"}

@app.post("/api/generate")
def generate_qr(request: QRRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(request.url)
    qr.make(fit=True)
    
    # Convert hex to RGB tuple for styledpil
    def hex_to_rgb(h):
        h = h.lstrip('#')
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
        
    bg_rgb = hex_to_rgb(request.bg_color)
    fill_rgb = hex_to_rgb(request.fill_color)

    if request.use_gradient:
        # Note: RadialGradiantColorMask takes back_color and center_color/edge_color
        color_mask = RadialGradiantColorMask(back_color=bg_rgb, center_color=fill_rgb, edge_color=(0,0,0))
    else:
        color_mask = SolidFillColorMask(back_color=bg_rgb, front_color=fill_rgb)
        
    img = qr.make_image(
        image_factory=StyledPilImage,
        color_mask=color_mask
    )
    
    img_buffer = io.BytesIO()
    img.save(img_buffer, format="PNG")
    img_bytes = img_buffer.getvalue()
    
    encoded_img = base64.b64encode(img_bytes).decode('utf-8')
    return {"image": f"data:image/png;base64,{encoded_img}"}
