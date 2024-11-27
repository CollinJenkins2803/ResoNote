from pydub import AudioSegment
import os
from yt_dlp import YoutubeDL

def split_audio(file_path, chunk_length_ms, upload_folder):
    """Split an audio file into chunks."""
    audio = AudioSegment.from_file(file_path)
    chunk_paths = []

    for i in range(0, len(audio), chunk_length_ms):
        chunk = audio[i:i + chunk_length_ms]
        chunk_path = os.path.join(upload_folder, f"chunk_{i // chunk_length_ms}.m4a")
        chunk.export(chunk_path, format="mp4", codec="aac")
        chunk_paths.append(chunk_path)

    return chunk_paths

def download_audio_from_url(url, upload_folder):
    """Download audio from a URL using yt-dlp."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(upload_folder, '%(id)s.%(ext)s'),
        'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'm4a', 'preferredquality': '192'}],
        'keepvideo': False,
    }

    with YoutubeDL(ydl_opts) as downloader:
        result = downloader.extract_info(url, download=True)
        audio_path = os.path.join(upload_folder, f"{result['id']}.m4a")

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"File not found: {audio_path}")

    return audio_path
