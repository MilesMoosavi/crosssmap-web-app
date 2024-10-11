document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');

    const placeNodeButton = document.getElementById('place-node');
    const nodeRadiusInput = document.getElementById('node-radius');
    let placingNode = false;

    // Array to store placed nodes
    const placedNodes = [];

    // Function to redraw the canvas
    function redrawCanvas(canvas, ctx) {
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
    document.getElementById('open-file').addEventListener('click', openFile);
    document.getElementById('open-file-main').addEventListener('click', openFile);
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    console.log('Image loaded:', img.src);
                    createNewTab(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Function to create a new tab
    function createNewTab(image) {
        const tabCount = document.querySelectorAll('.tab-button').length;
        const newTabId = `tab-${tabCount}`;
        const newTabButton = document.createElement('button');
        newTabButton.className = 'tab-button';
        newTabButton.setAttribute('data-tab', newTabId);
        newTabButton.innerHTML = `Tab ${tabCount} <span class="close-tab">×</span>`;
        document.querySelector('.tab-bar').insertBefore(newTabButton, document.getElementById('add-tab'));

        const newTabContent = document.createElement('div');
        newTabContent.className = 'tab-content';
        newTabContent.id = newTabId;
        newTabContent.innerHTML = `
            <div class="canvas-container">
                <canvas id="canvas-${tabCount}"></canvas>
                <div class="node-icon" id="node-icon-${tabCount}"></div>
                <div class="zoom-control">
                    <span class="zoom-icon">🔍-</span>
                    <input type="range" id="zoom-slider-${tabCount}" min="50" max="200" value="100">
                    <span class="zoom-icon">🔍+</span>
                    <span id="zoom-percentage-${tabCount}">100%</span>
                </div>
            </div>
        `;
        document.querySelector('.tab-container').appendChild(newTabContent);

        const newCanvas = document.getElementById(`canvas-${tabCount}`);
        const newCtx = newCanvas.getContext('2d');
        newCanvas.width = image.width;
        newCanvas.height = image.height;
        newCtx.drawImage(image, 0, 0);
        newCanvas.image = image; // Store the image in the canvas element

        newTabButton.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            newTabButton.classList.add('active');
            newTabContent.classList.add('active');
            showLeftPanel();
        });

        newTabButton.querySelector('.close-tab').addEventListener('click', (e) => {
            e.stopPropagation();
            newTabButton.remove();
            newTabContent.remove();
            if (newTabButton.classList.contains('active')) {
                const remainingTabs = document.querySelectorAll('.tab-button:not(#add-tab)');
                if (remainingTabs.length > 0) {
                    remainingTabs[0].click();
                } else {
                    showNoFileMessage();
                    hideLeftPanel();
                }
            }
        });

        newTabButton.click();
        hideNoFileMessage();
        showLeftPanel();

        // Add event listeners for zoom and node placement for the new canvas
        addCanvasEventListeners(newCanvas, newCtx, newTabId);
    }

    // Function to show the "No File Active" message
    function showNoFileMessage() {
        document.querySelector('.no-file-message').style.display = 'flex';
    }

    // Function to hide the "No File Active" message
    function hideNoFileMessage() {
        document.querySelector('.no-file-message').style.display = 'none';
    }

    // Function to show the left panel
    function showLeftPanel() {
        document.querySelector('.left-panel').style.display = 'block';
    }

    // Function to hide the left panel
    function hideLeftPanel() {
        document.querySelector('.left-panel').style.display = 'none';
    }

    // Show the "No File Active" message on load
    showNoFileMessage();
    hideLeftPanel();

    // Handle drag and drop file upload
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    document.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    createNewTab(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Function to add event listeners for zoom and node placement for a canvas
    function addCanvasEventListeners(canvas, ctx, tabId) {
        const zoomSlider = document.getElementById(`zoom-slider-${tabId}`);
        const zoomPercentage = document.getElementById(`zoom-percentage-${tabId}`);
        let zoomLevel = 1;

        // Zoom with slider
        zoomSlider.addEventListener('input', () => {
            const zoomValue = zoomSlider.value;
            zoomLevel = zoomValue / 100;
            canvas.style.transform = `scale(${zoomLevel})`;
            zoomPercentage.textContent = `${zoomValue}%`;
            console.log('Zoom level set to:', zoomValue);
        });

        // Zoom with mouse scrolling
        canvas.parentElement.addEventListener('wheel', (event) => {
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
                canvas.parentElement.scrollTop += event.deltaY;
                console.log('Mouse wheel used for scrolling, deltaY:', event.deltaY);
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
                redrawCanvas(canvas, ctx);
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
                redrawCanvas(canvas, ctx);

                // Draw the blue opaque circle
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                ctx.fill();
            } else {
                // Redraw the canvas to include placed nodes and the image
                redrawCanvas(canvas, ctx);
            }
        });
    }
});