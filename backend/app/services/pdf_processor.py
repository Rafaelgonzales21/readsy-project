# Servicio encargado de extraer texto desde un PDF

import fitz
from io import BytesIO

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