from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import qrcode
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
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_buffer = io.BytesIO()
    img.save(img_buffer, format="PNG")
    img_bytes = img_buffer.getvalue()
    
    encoded_img = base64.b64encode(img_bytes).decode('utf-8')
    return {"image": f"data:image/png;base64,{encoded_img}"}
