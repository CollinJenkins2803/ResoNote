from flask import Blueprint, request, jsonify, render_template
from flask_socketio import emit
from io import BytesIO
import threading
import os
import uuid
from .config import Config
from .utils import clear_upload_folder, save_audio_file
from .audio_processing import split_audio, download_audio_from_url
from .transcription import transcribe_audio_with_whisper, generate_notes
from .extensions import socketio

routes = Blueprint("routes", __name__)

audio_buffers = {}
buffer_lock = threading.Lock()

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return "No file part", 400

    audio_file = request.files['file']
    audio_path = save_audio_file(audio_file, Config.UPLOAD_FOLDER)
    chunks = split_audio(audio_path, Config.CHUNK_LENGTH_MS, Config.UPLOAD_FOLDER)
    transcription = " ".join([transcribe_audio_with_whisper(chunk) for chunk in chunks])
    clear_upload_folder(Config.UPLOAD_FOLDER)
    print(transcription)
    return jsonify({"transcription": transcription})

@routes.route('/generate-notes', methods=['POST'])
def notes():
    data = request.json
    transcription = data.get('transcription', '')
    if not transcription:
        return "Transcription required", 400
    notes = generate_notes(transcription)
    return jsonify({"notes": notes})

@routes.route('/process-url', methods=['POST'])
def process_url():
    data = request.json
    url = data.get('url')
    if not url:
        return "URL is required", 400
    audio_path = download_audio_from_url(url, Config.UPLOAD_FOLDER)
    chunks = split_audio(audio_path, Config.CHUNK_LENGTH_MS, Config.UPLOAD_FOLDER)
    transcription = " ".join([transcribe_audio_with_whisper(chunk) for chunk in chunks])
    notes = generate_notes(transcription)
    clear_upload_folder(Config.UPLOAD_FOLDER)
    print(transcription)
    return jsonify({"notes": notes, "transcription": transcription})

@socketio.on('connect', namespace='/audio-stream')
def handle_audio_connect():
    sid = request.sid
    audio_buffers[sid] = BytesIO()
    print(f"Client connected: SID {sid}")

@socketio.on('disconnect', namespace='/audio-stream')
def handle_audio_disconnect():
    sid = request.sid
    if sid in audio_buffers:
        del audio_buffers[sid]
        print(f"Audio buffer cleared for SID {sid}")
    print(f"Client disconnected: SID {sid}")

@socketio.on('audio-stream', namespace='/audio-stream')
def handle_audio_stream(data):
    sid = request.sid
    if sid not in audio_buffers:
        audio_buffers[sid] = BytesIO()
        print(f"Buffer created for SID {sid}")

    audio_buffer = audio_buffers[sid]
    with buffer_lock:
        if isinstance(data, (bytes, bytearray)):
            audio_buffer.write(data)
            print(f"Audio chunk received for SID {sid}: {len(data)} bytes")
        else:
            print(f"Invalid data type for SID {sid}: {type(data)}")

@socketio.on('stop-recording', namespace='/audio-stream')
def process_audio_buffer():
    sid = request.sid
    if sid not in audio_buffers:
        emit('error', {'message': 'No audio data available.'}, namespace='/audio-stream')
        return

    audio_buffer = audio_buffers[sid]
    audio_buffer.seek(0)
    buffer_data = audio_buffer.read()
    print(f"Buffer data size for SID {sid}: {len(buffer_data)} bytes")

    audio_file_path = os.path.join(Config.UPLOAD_FOLDER, f"{uuid.uuid4().hex}.webm")
    with open(audio_file_path, 'wb') as f:
        f.write(buffer_data)
        print(f"Audio file saved for SID {sid}: {audio_file_path}")

    try:
        chunks = split_audio(audio_file_path, Config.CHUNK_LENGTH_MS, Config.UPLOAD_FOLDER)
        transcription = " ".join([transcribe_audio_with_whisper(chunk) for chunk in chunks])
        notes = generate_notes(transcription)

        emit('transcription-notes', {'transcription': transcription, 'notes': notes}, namespace='/audio-stream')
    except Exception as e:
        print(f"Error processing audio for SID {sid}: {e}")
        emit('error', {'message': str(e)}, namespace='/audio-stream')
    finally:
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)
            print(f"Temporary file deleted for SID {sid}: {audio_file_path}")
        del audio_buffers[sid]
        print(f"Audio buffer cleared for SID {sid}")
