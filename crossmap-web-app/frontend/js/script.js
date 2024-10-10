const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const openFileInput = document.getElementById('open-file');
let zoomLevel = 1;
let placingNode = false;
const nodeRadiusSlider = document.getElementById('node-radius');
const leftPanel = document.querySelector('.left-panel');  // Select the left panel

document.getElementById('open-file-button').addEventListener('click', () => {
    openFileInput.click();
});

openFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                leftPanel.style.display = 'block'; // Make the left panel visible after image load
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('zoom-in').addEventListener('click', () => {
    setZoom(zoomLevel * 1.2);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    setZoom(zoomLevel / 1.2);
});

function setZoom(newZoom) {
    zoomLevel = newZoom;
    canvas.style.transform = `scale(${zoomLevel})`;
}

container.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setZoom(zoomLevel * zoomFactor);
    } else {
        container.scrollTop += event.deltaY;
    }
});

document.getElementById('place-node').addEventListener('click', () => {
    placingNode = true;
});

canvas.addEventListener('click', (event) => {
    if (placingNode) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / zoomLevel;
        const y = (event.clientY - rect.top) / zoomLevel;
        const radius = parseInt(nodeRadiusSlider.value);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
        placingNode = false;
    }
});
