import openai
import requests
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def transcribe_audio_with_whisper(audio_file_path):
    """Transcribe audio using OpenAI Whisper API."""
    with open(audio_file_path, "rb") as audio_file:
        response = openai.Audio.transcribe(model="whisper-1", file=audio_file, response_format="text")
        if isinstance(response, str):
            return response
        return response.get('text', '')

def generate_notes(transcription):
    """Generate notes from transcription using GPT-4."""
    api_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are an expert-level note-taker."},
            {"role": "user", "content": f"Create a note guide:\n\n{transcription}"}
        ],
        "temperature": 0.5
    }

    response = requests.post(api_url, json=data, headers=headers)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
