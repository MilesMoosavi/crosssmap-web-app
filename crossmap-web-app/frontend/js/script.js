document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');
    const nodeIcon = document.getElementById('node-icon');
    let zoomLevel = 1;
    const leftPanel = document.querySelector('.left-panel'); 
    const placeNodeButton = document.getElementById('place-node');
    const nodeRadiusInput = document.getElementById('node-radius');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomPercentage = document.getElementById('zoom-percentage');
    let placingNode = false;

    // Array to store placed nodes
    const placedNodes = [];

    // Function to redraw the canvas
    function redrawCanvas() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the image if any
        if (canvas.image) {
            ctx.drawImage(canvas.image, 0, 0);
        }

        // Redraw all placed nodes
        placedNodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
        });
    }

    // Check if place node button is loaded in
    if (placeNodeButton) {
        console.log('Place Node button found');
        placeNodeButton.addEventListener('click', () => {
            placingNode = !placingNode;
            console.log('Place Node button toggled:', placingNode);
            placeNodeButton.classList.toggle('active', placingNode);
            nodeRadiusInput.disabled = !placingNode;
            nodeIcon.style.display = placingNode ? 'block' : 'none';
        });
    } else {
        console.error('Place Node button not found');
    }

    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Function to handle file opening
    function openFile() {
        console.log('Open File button clicked');
        fileInput.click();
    }

    // "Open File" button in the dropdown
    document.querySelector('.dropdown-content button:nth-child(2)').addEventListener('click', openFile);
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    console.log('Image loaded:', img.src);
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    canvas.image = img; // Store the image in the canvas element
                    document.querySelector('.left-panel').style.display = 'flex'; // Show the left panel
                    placingNode = false; // Ensure placingNode is false when an image is loaded
                    placeNodeButton.classList.remove('active');
                    nodeRadiusInput.disabled = true;
                    nodeIcon.style.display = 'none';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Canvas event listener for on click command
    canvas.addEventListener('click', (event) => {
        if (placingNode) {
            console.log('Canvas clicked at:', event.clientX, event.clientY);
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / zoomLevel;
            const y = (event.clientY - rect.top) / zoomLevel;
            const radius = parseInt(nodeRadiusInput.value);

            // Add the new node to the array of placed nodes
            placedNodes.push({ x, y, radius });

            // Redraw the canvas to include the new node
            redrawCanvas();
        }
    });

    // Show the node icon when hovering over the canvas
    canvas.addEventListener('mousemove', (event) => {
        if (placingNode) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / zoomLevel;
            const y = (event.clientY - rect.top) / zoomLevel;
            const radius = parseInt(nodeRadiusInput.value);

            // Redraw the canvas to include placed nodes and the image
            redrawCanvas();

            // Draw the blue opaque circle
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
            ctx.fill();
        } else {
            // Redraw the canvas to include placed nodes and the image
            redrawCanvas();
        }
    });

    // Zoom with slider
    zoomSlider.addEventListener('input', () => {
        const zoomValue = zoomSlider.value;
        zoomLevel = zoomValue / 100;
        canvas.style.transform = `scale(${zoomLevel})`;
        zoomPercentage.textContent = `${zoomValue}%`;
        console.log('Zoom level set to:', zoomValue);
    });

    // Zoom with mouse scrolling
    container.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
            zoomLevel *= zoomFactor;
            const zoomValue = Math.round(zoomLevel * 100);
            zoomSlider.value = zoomValue;
            canvas.style.transform = `scale(${zoomLevel})`;
            zoomPercentage.textContent = `${zoomValue}%`;
            console.log('Zoom level set to:', zoomValue);
        } else {
            container.scrollTop += event.deltaY;
            console.log('Mouse wheel used for scrolling, deltaY:', event.deltaY);
        }
    });

    // Increment or decrement node radius with mouse wheel
    nodeRadiusInput.addEventListener('wheel', (event) => {
        event.preventDefault();
        console.log('Wheel event detected on node radius input');
        const delta = event.deltaY > 0 ? -1 : 1;
        const currentValue = parseInt(nodeRadiusInput.value);
        console.log('Current value:', currentValue);
        const newValue = Math.max(1, currentValue + delta);
        nodeRadiusInput.value = newValue;
        console.log('Node radius input changed to:', newValue);
    });
});