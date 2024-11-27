const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const chatWindow = document.getElementById('file-info');  // Displays uploaded files
const generatedNotes = document.getElementById('generated-notes');  // Displays notes
const spinner = document.getElementById('loading-spinner');
const processUrlBtn = document.getElementById('processUrlBtn');
const urlInput = document.getElementById('urlInput');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');

const MAX_FILE_SIZE_MB = 300;
let mediaRecorder;
let socket;
let isProcessing = false;
const uploadedFiles = new Set();

// Drag and drop events
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    await handleFiles(files);
});

dropArea.addEventListener('click', () => fileElem.click());

fileElem.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);
    await handleFiles(files);
    fileElem.value = '';  // Clear input
});

async function handleFiles(files) {
    if (isProcessing) return;
    isProcessing = true;

    for (const file of files) {
        if (uploadedFiles.has(file.name)) {
            alert(`${file.name} already processed.`);
            continue;
        }

        uploadedFiles.add(file.name);

        if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
            alert(`${file.name} exceeds the size limit.`);
        } else {
            displayFileMessage(file);
            const transcription = await transcribeAudio(file);
            if (transcription) {
                const notes = await generateNotes(transcription);
                displayNotes(notes);
            }
        }
    }

    isProcessing = false;
}

function displayFileMessage(file) {
    chatWindow.innerHTML = `<p>${file.name} (${(file.size / 1024).toFixed(2)} KB) uploaded.</p>`;
}

async function transcribeAudio(file) {
    try {
        showSpinner();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Transcription failed.');
        const data = await response.json();
        return data.transcription;
    } catch (error) {
        console.error('Transcription Error:', error);
        alert('Error during transcription.');
    } finally {
        hideSpinner();
    }
}

async function generateNotes(transcription) {
    try {
        const response = await fetch('/generate-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcription }),
        });

        if (!response.ok) throw new Error('Notes generation failed.');
        const data = await response.json();
        return data.notes;
    } catch (error) {
        console.error('Notes Generation Error:', error);
        alert('Error generating notes.');
    }
}

// Global variable to store dynamically generated notes
let currentNotes = '';

function displayNotes(notes) {
    // Save the dynamic notes content to global variable
    currentNotes = notes;

    const message = document.createElement('div');
    message.classList.add('message', 'alert', 'custom-alert', 'fade-in');  // Add fade-in effect

    const formatted = formatNotes(notes);  // Format the notes dynamically

    // Add the copy button HTML next to the generated notes
    message.innerHTML = `
        <strong>Generated Notes:</strong><br>${formatted}
        <button class="copy-btn" onclick="copyFormattedNotes()">📋 Copy</button>
    `;

    generatedNotes.appendChild(message);
    generatedNotes.scrollTop = generatedNotes.scrollHeight;  // Auto-scroll to the bottom
}

// Function to copy formatted notes to clipboard
function copyFormattedNotes() {
    // Use the global variable `currentNotes` to get the latest notes
    const plainText = currentNotes.replace(/<h3>(.*?)<\/h3>/g, '\n$1\n')
                                  .replace(/<ul>/g, '\n')
                                  .replace(/<\/ul>/g, '\n')
                                  .replace(/<li>(.*?)<\/li>/g, '  • $1\n')
                                  .replace(/<p>(.*?)<\/p>/g, '$1\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plainText)
            .then(() => alert('Notes copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    } else {
        fallbackCopyTextToClipboard(plainText);
    }
}

// Fallback for older browsers
function fallbackCopyTextToClipboard(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    alert('Notes copied to clipboard!');
}

// Helper function to format notes like ChatGPT
function formatNotes(notes) {
    let formatted = '';
    const lines = notes.split('\n');  // Split response into lines

    lines.forEach(line => {
        if (line.startsWith('#')) {
            formatted += `<h3>${line.replace(/#/g, '').trim()}</h3>`;
        } else if (line.startsWith('-') || line.startsWith('*')) {
            formatted += `<li>${line.replace(/[-*]/, '').trim()}</li>`;
        } else if (/^\d+\./.test(line)) {
            formatted += `<li>${line.trim()}</li>`;
        } else {
            formatted += `<p>${line.trim()}</p>`;
        }
    });

    formatted = formatted.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');  // Wrap list items in <ul>
    return formatted;
}

processUrlBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a valid URL.');
        return;
    }

    try {
        showSpinner();
        const response = await fetch('/process-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error('Error processing the URL.');

        const data = await response.json();
        displayNotes(data.notes);
    } catch (error) {
        console.error('URL Processing Error:', error);
        alert('Error processing the URL.');
    } finally {
        hideSpinner();
    }
});

function showSpinner() {
    spinner.style.display = 'inline-block';
}

function hideSpinner() {
    spinner.style.display = 'none';
}

// Handle Live Recording
startRecordingBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Live audio streaming is not supported in this browser.");
        console.error("MediaDevices API is unavailable.");
        return;
    }

    try {
        console.log("Attempting to access microphone...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });


        // Initialize Socket.IO
        socket = io('/audio-stream');
        socket.binaryType = 'arraybuffer';

        socket.on('connect', () => {
            console.log("Socket.IO connection established.");
            mediaRecorder.start(1000); // Send chunks every second
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
        });

        socket.on('disconnect', () => {
            console.log("Socket.IO connection closed.");
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
        });

        socket.on('connect_error', (error) => {
            console.error("Socket.IO connection error:", error);
        });

        socket.on('transcription-notes', (data) => {
            if (data.transcription) {
                console.log("Received transcription:", data.transcription);
            }
            if (data.notes) {
                console.log("Received notes:", data.notes);
                displayNotes(data.notes);
            }
            if (socket.connected) {
                socket.disconnect();
            }
        });

        socket.on('error', (data) => {
            console.error("Error from server:", data.message);
            alert('Error from server: ' + data.message);
            if (socket.connected) {
                socket.disconnect();
            }
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.connected) {
                console.log("Sending audio chunk...");
                event.data.arrayBuffer().then(buffer => {
                    socket.emit('audio-stream', buffer);
                });
            }
        };
        

        mediaRecorder.onstop = () => {
            if (socket.connected) {
                console.log("Sending stop-recording signal...");
                socket.emit('stop-recording');
                //socket.disconnect();
            }
        };

        stopRecordingBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                startRecordingBtn.disabled = false;
                stopRecordingBtn.disabled = true;
            }
        });

    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
});

stopRecordingBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        console.log("Stop button clicked. MediaRecorder stopped.");
    } else {
        console.warn("Stop button clicked, but MediaRecorder is already inactive.");
    }
});