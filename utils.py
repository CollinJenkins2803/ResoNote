import os
import shutil

def clear_upload_folder(upload_folder):
    """Delete all files inside the upload folder without removing the folder."""
    for filename in os.listdir(upload_folder):
        file_path = os.path.join(upload_folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

def save_audio_file(audio_file, upload_folder):
    """Save an uploaded audio file to the upload folder."""
    file_path = os.path.join(upload_folder, audio_file.filename)
    audio_file.save(file_path)
    return file_path
