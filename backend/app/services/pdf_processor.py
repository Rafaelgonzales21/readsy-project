# Servicio encargado de extraer texto desde un PDF

import fitz
from io import BytesIO
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """ Encargado de extraer el texto del pdf usando PyMuPDF """
    try:
        pdf_stream = BytesIO(file_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")

        text = ""
        for page in doc:
            text += page.get_text()

        doc.close()

        if not text.strip():
            return "Error: No text found in PDF"
        
        return text
    
    except Exception as e:
        return f"Error processing PDF: {e}"

def extract_pdf_title(pdf_path: str, text: str = "") -> str:
    reader = PdfReader(BytesIO(pdf_path))
    metadata = reader.metadata

    title = metadata.title if metadata and metadata.title else "Untitled PDF"
    
    if not title and text:
        first_line = text.split("\n")[0].strip()
        if first_line and len(first_line) < 100:
            title = first_line
    
    return title