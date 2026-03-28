import './style.css';
import { generateDesmosEquations } from './desmos-converter';

const appHTML = `
  <header>
    <h1>Pic2Graph</h1>
    <p class="subtitle">Convert any image into human-like curves for Desmos</p>
  </header>

  <div class="main-container">
    <!-- Left Column: Settings and Input -->
    <div class="panel">
      <h2>1. Choose Image</h2>

      <div id="uploadArea" class="upload-area">
        <input type="file" id="fileInput" accept="image/png, image/jpeg, image/webp" />
        <span id="uploadText">Drag & Drop or <strong>Click to Browse</strong></span>
        <div class="preview-container">
          <img id="imagePreview" alt="Preview" />
        </div>
      </div>

      <div class="control-group" style="margin-top: 1rem;">
        <div class="control-header">
          <label for="toleranceSlider"><strong>Detail Level</strong></label>
          <span id="toleranceValue">Smooth (Human-like)</span>
        </div>
        <!--
          Higher imagetracerjs tolerance = simpler, smoother shapes (fewer curves)
          Lower tolerance = more detailed, closely matching pixels (more curves)
        -->
        <input type="range" id="toleranceSlider" min="1" max="50" value="20" step="1">
        <small style="color: var(--text-muted); font-size: 0.8rem;">
          Slide left for more detail, right for fewer, smoother curves.
        </small>
      </div>

      <button id="generateBtn" class="btn" disabled>Generate Curves</button>
      <div id="status" class="status"></div>
    </div>

    <!-- Right Column: Results -->
    <div class="panel">
      <h2>2. Copy Equations</h2>
      <textarea id="equations" readonly placeholder="Your equations will appear here..."></textarea>

      <div class="control-header" style="align-items: center;">
        <span id="equationCount" style="color: var(--text-muted); font-weight: 500;">0 equations</span>
        <button id="copyBtn" class="btn" style="background-color: #10B981;" disabled>Copy to Clipboard</button>
      </div>
    </div>
  </div>
`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = appHTML;

// --- Elements ---
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const uploadArea = document.getElementById('uploadArea') as HTMLDivElement;
const uploadText = document.getElementById('uploadText') as HTMLSpanElement;
const imagePreview = document.getElementById('imagePreview') as HTMLImageElement;
const toleranceSlider = document.getElementById('toleranceSlider') as HTMLInputElement;
const toleranceValue = document.getElementById('toleranceValue') as HTMLSpanElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const equationsTextarea = document.getElementById('equations') as HTMLTextAreaElement;
const equationCount = document.getElementById('equationCount') as HTMLSpanElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;

// --- State ---
let currentImage: HTMLImageElement | null = null;
let worker: Worker | null = null;

// Initialize Web Worker
if (window.Worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
} else {
    statusDiv.innerHTML = '<span style="color: red;">Error: Web Workers not supported in your browser.</span>';
}

// --- Event Listeners ---
toleranceSlider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (val < 10) toleranceValue.innerText = "Detailed (Many curves)";
    else if (val < 30) toleranceValue.innerText = "Balanced";
    else toleranceValue.innerText = "Smooth (Human-like)";
});

uploadArea.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', handleDrop);

function handleDrop(e: DragEvent) {
    uploadArea.classList.remove('dragover');
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
        fileInput.files = dt.files;
        handleFileSelect(dt.files[0]);
    }
}

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        handleFileSelect(this.files[0]);
    }
});

function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
            uploadText.style.display = 'none';
            imagePreview.style.display = 'block';
            imagePreview.src = e.target.result;

            const img = new Image();
            img.onload = () => {
                currentImage = img;
                generateBtn.disabled = false;
            };
            img.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

generateBtn.addEventListener('click', () => {
    if (!currentImage || !worker) return;

    // Reset UI
    generateBtn.disabled = true;
    equationsTextarea.value = '';
    copyBtn.disabled = true;
    equationCount.innerText = 'Processing...';
    statusDiv.innerHTML = '<div class="loader"></div> Extracting curves...';

    // Extract pixel data
    const canvas = document.createElement('canvas');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        statusDiv.innerHTML = '<span style="color: red;">Error: Could not get 2D context.</span>';
        generateBtn.disabled = false;
        return;
    }

    ctx.drawImage(currentImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Call Worker
    worker.postMessage({
        imageData: imageData,
        width: canvas.width,
        height: canvas.height,
        tolerance: parseInt(toleranceSlider.value, 10)
    });
});

worker!.onmessage = (e: MessageEvent) => {
    const data = e.data;

    if (!data.success) {
        statusDiv.innerHTML = `<span style="color: red;">Error: ${data.error}</span>`;
        generateBtn.disabled = false;
        return;
    }

    statusDiv.innerHTML = '<div class="loader"></div> Formatting equations...';

    // The data mapping can freeze the UI if there are huge amounts of equations,
    // so we wrap it in a setTimeout to let the DOM update the status text first.
    setTimeout(() => {
        try {
            const equations = generateDesmosEquations(data.tracedData, currentImage!.width, currentImage!.height);

            equationsTextarea.value = equations.join('\n');
            equationCount.innerText = `${equations.length.toLocaleString()} equations`;

            if (equations.length > 0) {
                copyBtn.disabled = false;
            }

            statusDiv.innerHTML = '<span style="color: #10B981; font-weight: bold;">✓ Generation Complete!</span>';
        } catch (err) {
            statusDiv.innerHTML = `<span style="color: red;">Error formatting equations.</span>`;
            console.error(err); statusDiv.innerHTML = `<span style='color: red;'>Error formatting equations: ${err instanceof Error ? err.message : String(err)}</span>`;
        }

        generateBtn.disabled = false;
        setTimeout(() => {
            if (statusDiv.innerHTML.includes('Complete')) statusDiv.innerHTML = '';
        }, 3000);
    }, 50);
};

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(equationsTextarea.value);
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '✓ Copied!';
        copyBtn.style.backgroundColor = '#059669';

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.backgroundColor = '#10B981';
        }, 2000);
    } catch (err) {
        alert("Failed to copy text. Please select the text and copy manually.");
    }
});
