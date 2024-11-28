# ResoNotes

# **Resonate Ideas, Generate Notes Documentation**

## **Table of Contents**
1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Setup Instructions](#setup-instructions)
6. [Project Structure](#project-structure)
7. [API Reference](#api-reference)
8. [Frontend Functionality](#frontend-functionality)
9. [WebSocket Integration](#websocket-integration)
10. [Troubleshooting](#troubleshooting)

---

## **Overview**
**ResoNote** is a Flask-based application that allows users to:
1. Upload or live-stream audio files.
2. Automatically transcribe audio content using OpenAI Whisper API.
3. Generate structured notes from the transcription using GPT 4o.
4. Download audio content from YouTube or other sources via `yt-dlp`.

The application is designed for simplicity, extensibility, and usability across various devices.

---

## **Features**
- **Audio Upload**: Upload local audio files for transcription and note generation.
- **Live Audio Streaming**: Stream audio in real-time for transcription.
- **YouTube Audio Processing**: Enter a YouTube URL to download, transcribe, and generate notes.
- **Structured Notes**: Generate professional, structured notes for better comprehension.
- **Drag-and-Drop**: Upload files easily via drag-and-drop functionality.
- **WebSocket Support**: Real-time audio streaming using Socket.IO.

---

## **Technologies Used**
### **Backend**
- Flask (Python)
- Flask-SocketIO
- OpenAI Whisper API
- yt-dlp (YouTube audio downloader)
- Pydub (Audio processing)

### **Frontend**
- HTML/CSS/JavaScript
- Bootstrap (UI framework)
- Socket.IO (WebSocket library)

### **Environment**
- Python 3.9+
- Virtual Environment (`venv`)

---

## **Prerequisites**
Before setting up and running the application, ensure you have the following tools and dependencies installed on your system.

---

### **1. Python 3.9+**
- **Why You Need It**: The backend of the application is written in Python, so you need Python installed to run it.
- **How to Check if You Have Python**:
  Open a terminal or command prompt and run:
  ```bash
  python --version
  ```
  or
  ```bash
  python3 --version
  ```
  You should see a version number like `3.9.x` or higher.
  
- **How to Install Python**:
  - **Linux**:
    ```bash
    sudo apt update
    sudo apt install python3 python3-pip
    ```
  - **macOS**:
    Install Python using Homebrew:
    ```bash
    brew install python
    ```
  - **Windows**:
    Install Python using `winget`:
    ```bash
    winget install -e --id Python.Python.3.9
    ```

---

### **2. pip (Python Package Installer)**
- **Why You Need It**: pip is used to install Python libraries and dependencies, such as Flask and Socket.IO.
- **How to Check if You Have pip**:
  Run:
  ```bash
  pip --version
  ```
  or
  ```bash
  pip3 --version
  ```

- **How to Install pip**:
  pip is included with most Python installations. If it’s missing:
  - **Linux**:
    ```bash
    sudo apt install python3-pip
    ```
  - **macOS**:
    Install pip with Python (via Homebrew or Python.org).
  - **Windows**:
    pip is included with the Python installation via `winget`.

---

### **3. Git**
- **Why You Need It**: Git is required to clone the project repository from GitHub.
- **How to Check if You Have Git**:
  Run:
  ```bash
  git --version
  ```

- **How to Install Git**:
  - **Linux**:
    ```bash
    sudo apt update
    sudo apt install git
    ```
  - **macOS**:
    Install Git using Homebrew:
    ```bash
    brew install git
    ```
  - **Windows**:
    Install Git using `winget`:
    ```bash
    winget install -e --id Git.Git
    ```

---

### **4. Text Editor or IDE**
- **Why You Need It**: A text editor or IDE is necessary for editing code or configuration files.
- **Recommended Options**:
  - **VS Code**:
    - **Linux**:
      ```bash
      sudo snap install --classic code
      ```
    - **macOS**:
      Install using Homebrew:
      ```bash
      brew install --cask visual-studio-code
      ```
    - **Windows**:
      Install using `winget`:
      ```bash
      winget install -e --id Microsoft.VisualStudioCode
      ```

---

### **5. FFmpeg**
- **Why You Need It**: Required for audio processing tasks in the application.
- **How to Install FFmpeg**:
  - **Linux**:
    ```bash
    sudo apt update
    sudo apt install ffmpeg
    ```
  - **macOS**:
    Install FFmpeg using Homebrew:
    ```bash
    brew install ffmpeg
    ```
  - **Windows**:
    Install FFmpeg using `winget`:
    ```bash
    winget install -e --id Gyan.FFmpeg
    ```

---

### **6. OpenAI API Key**
- **Why You Need It**: The application uses OpenAI’s API for transcription and note generation.
- **How to Obtain an API Key**:
  1. Sign up or log in to [OpenAI](https://platform.openai.com/).
  2. Generate an API key from your account settings.
  3. Add the key to the `.env` file in the project or set it in Windows enviroment variables setting:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ```
    
---

### **7. Virtual Environment Tool (Optional, Recommended)**
- **Why You Need It**: Virtual environments isolate dependencies for the project, avoiding conflicts with other Python applications.
- **How to Check if You Have Virtualenv**:
  Run:
  ```bash
  python -m venv --help
  ```
  - If the command works, virtual environments are already set up.

- **How to Use It**:
  Create a virtual environment by running:
  - **Linux/macOS**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
  - **Windows**:
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```

---

### **Summary**
Ensure the following are installed and configured before proceeding:
- Python 3.9+ and pip
- Git
- Node.js and npm (optional)
- FFmpeg
- OpenAI API key
- A virtual environment for project isolation

If you encounter any issues during installation, refer to the official documentation for each tool or contact the project maintainers.

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone https://github.com/CollinJenkins2803/ResoNote.git
cd ResoNote
```

### **2. Create a Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### **3. Install Backend Dependencies**
```bash
pip install -r requirements.txt
```

### **4. Configure Environment Variables (Optional, Mac & Linux)**
Create a `.env` file in the root directory and add:
```
OPENAI_API_KEY=your_openai_api_key
```

### **5. Start the Python Module**
```bash
cd ..
python -m ResoNote
```

---
## **Project Structure**
```plaintext
AudioToNotes/
│
├── ResoNote/                # Main application package
│   ├── __init__.py          # Flask app initialization
│   ├── routes.py            # API routes and WebSocket handlers
│   ├── config.py            # Configuration settings
│   ├── extensions.py        # Socket.IO initialization
│   ├── utils.py             # Helper functions
│   ├── audio_processing.py  # Audio processing logic
│   ├── transcription.py     # Transcription and note generation
│   └── templates/           # HTML templates
│       └── index.html       # Main frontend page
│
├── static/                  # Frontend static files
│   ├── script.js            # Frontend JavaScript logic
│   ├── style.css            # Frontend styling
│
├── uploads/                 # Temporary folder for uploaded files
├── .gitignore               # Git ignore file
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
└── README.md                # Project readme
```

---

## **API Reference**

### **1. File Upload**
- **Endpoint**: `/transcribe`
- **Method**: `POST`
- **Description**: Accepts an audio file and returns its transcription.
- **Request**: 
  - Form-data: `file` (Audio file)
- **Response**:
```json
{
  "transcription": "Transcribed text here..."
}
```

---

### **2. Generate Notes**
- **Endpoint**: `/generate-notes`
- **Method**: `POST`
- **Description**: Accepts transcription text and returns structured notes.
- **Request**:
```json
{
  "transcription": "Transcribed text here..."
}
```
- **Response**:
```json
{
  "notes": "Generated notes here..."
}
```

---

### **3. Process YouTube URL**
- **Endpoint**: `/process-url`
- **Method**: `POST`
- **Description**: Downloads audio from a URL, transcribes it, and generates notes.
- **Request**:
```json
{
  "url": "https://youtube.com/somevideo"
}
```
- **Response**:
```json
{
  "transcription": "Transcribed text here...",
  "notes": "Generated notes here..."
}
```

---

### **4. WebSocket: Audio Streaming**
- **Namespace**: `/audio-stream`
- **Events**:
  - `audio-stream`: Send audio chunks for processing.
  - `stop-recording`: Signal to stop recording and process the buffer.
- **Response**:
```json
{
  "transcription": "Real-time transcription...",
  "notes": "Generated notes..."
}
```

---

## **Frontend Functionality**
1. **Drag-and-Drop Upload**:
   - Upload files directly to `/transcribe`.
2. **YouTube URL**:
   - Processes URLs via `/process-url`.
3. **Live Recording**:
   - Uses WebSocket `/audio-stream` for real-time streaming.

---

## **WebSocket Integration**
WebSocket connection is used for real-time audio streaming:
1. **Start Recording**:
   - Audio chunks are streamed via `audio-stream` events.
2. **Stop Recording**:
   - Triggers `stop-recording` to process and transcribe the audio.

---

## **Troubleshooting**

### **Common Issues**
1. **404 Not Found**:
   - Ensure the server is running (`python -m ResoNote).
   - Verify the correct endpoint is being accessed.

2. **WebSocket Connection Issues**:
   - Check if the `socketio` instance is correctly initialized.
   - Verify CORS settings in `extensions.py`.

3. **Transcription Errors**:
   - Ensure the `OPENAI_API_KEY` is set and valid.

4. **File Upload Issues**:
   - Ensure the `uploads/` directory exists and is writable.

---

## **Conclusion**
This documentation provides a complete guide to setting up, running, and extending **ResoNote**. If you encounter any issues or need further assistance, feel free to reach out.

/ **Collin P. Jenkins**  
John Chambers College of Business and Economics  
West Virginia University  
📞 (302)-650-3290 | 📧 [cpj00003@mix.wvu.edu](mailto:cpj00003@mix.wvu.edu)
