import os

class Config:
    UPLOAD_FOLDER = 'ResoNote/uploads/'
    BUFFER_SIZE_LIMIT = 300 * 1024 * 1024  # 300 MB
    CHUNK_LENGTH_MS = 600000  # 10 minutes
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Ensure upload folder exists
if not os.path.exists(Config.UPLOAD_FOLDER):
    os.makedirs(Config.UPLOAD_FOLDER)
