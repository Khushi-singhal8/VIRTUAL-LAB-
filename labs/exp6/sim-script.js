document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E4 script loaded');

    // Inject CSS for apparatus image sizing
    const style = document.createElement('style');
    style.innerHTML = `
.apparatus-img-box {
    width: 100%;
    height: 150px;              
    border: 1px solid #ccc;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;          
    background: #f8f9fa;
}

.apparatus-img-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;        
}

`;
    document.head.appendChild(style);

    // Inject print.css
    const printLink = document.createElement('link');
    printLink.rel = 'stylesheet';
    printLink.href = 'print.css'; // Assuming it's in the same directory relative to index.html
    document.head.appendChild(printLink);


    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    // Web Audio API context and buffer
    let audioCtx = null;
    let hissBuffer = null;

    /* ---------------- ASSET PRELOADING ---------------- */
    const assetList = [
        // Apparatus
        "images/simulation/torch.png",
        "images/simulation/oxygen cylinder.png",
        "images/simulation/acetylene cylinderr.png",
        "images/simulation/regulator.png",
        "images/simulation/striker.png",

        // Videos
        "images/simulation/1.mp4",
        "images/simulation/2.mp4",
        "images/simulation/3.mp4",
        "images/simulation/4.mp4",
        "images/simulation/5.mp4",
        "images/simulation/7.mp4",
        "images/simulation/8.mp4",
        "images/simulation/9.mp4",
        "images/simulation/10.mp4",
        "images/simulation/11.mp4",

        // Drag Step
        "images/simulation/6.png",
        "images/simulation/6-tool.png",
        "images/simulation/6.1.png",

        // Result
        "images/carbrizing flame.png",
        "images/neutral flame.png",
        "images/oxidising flame.png",

        // Audio
        "images/simulation/hiss.mp3"
    ];

    const assetCache = {};

    function getAssetSrc(originalUrl) {
        return assetCache[originalUrl] || originalUrl;
    }

    function formatSrc(url, timestamp) {
        const src = getAssetSrc(url);
        if (src.startsWith('blob:')) return src;
        return `${src}?t=${timestamp}`;
    }

    async function preloadAssets() {
        const overlay = document.createElement('div');
        overlay.id = 'preload-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">Loading simulation resources...</div>
            <div style="width: 300px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                <div id="preload-progress" style="width: 0%; height: 100%; background: #4CAF50; transition: width 0.3s;"></div>
            </div>
            <div id="preload-text" style="margin-top: 10px; font-size: 14px;">0%</div>
        `;
        document.body.appendChild(overlay);

        const progressBar = document.getElementById('preload-progress');
        const progressText = document.getElementById('preload-text');
        let loadedCount = 0;

        const promises = assetList.map(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                assetCache[url] = objectUrl;
            } catch (err) {
                console.error(`Error preloading ${url}:`, err);
            } finally {
                loadedCount++;
                const percent = Math.round((loadedCount / assetList.length) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = percent + '%';
            }
        });

        await Promise.all(promises);

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
                showCurrentStep();
            }, 500);
        }, 500);
    }

    async function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        if (!hissBuffer) {
            try {
                const src = getAssetSrc('images/simulation/hiss.mp3');
                const response = await fetch(src);
                const arrayBuffer = await response.arrayBuffer();
                hissBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.error('Error loading audio:', e);
            }
        }
    }

    let step1Completed = false;
    let step3Completed = false;
    let step5Completed = false;
    let step5_5Completed = false;
    let step7Completed = false;

    const steps = [
        {
            id: 'step0',
            title: 'Apparatus Identification',
            type: 'apparatus'
        },
        {
            id: 'step1',
            title: 'Setup',
            src: 'images/simulation/1.mp4',
            type: 'video',
            initialInstruction: 'Turn on the oxygen valve before setting the oxygen cylinder’s pressure',
            finalInstruction: 'Click on next to set the pressure',
            interaction: { pauseAt: 1.4, hotspot: { x: 0.4504105207511871, y: 0.42994331737492386, w: 0.07249351389399054, h: 0.12887735803376096 }, instruction: 'Turn on the oxygen valve before setting the oxygen cylinder’s pressure' }
        },
        {
            id: 'step2',
            title: 'Setup',
            src: 'images/simulation/2.mp4',
            type: 'video',
            initialInstruction: 'Set the pressure of oxygen cylinder to 15 PSI',
            finalInstruction: 'Click on next to close the oxygen valve',
            interaction: { pauseAt: 1.55, hotspot: { x: 0.34345287730103713, y: 0.2598674596418459, w: 0.21985737820308607, h: 0.13732833233105676 }, instruction: 'Set the pressure of oxygen cylinder to 15 PSI' }
        },
        {
            id: 'step3',
            title: 'Setup',
            src: 'images/simulation/3.mp4',
            type: 'video',
            initialInstruction: 'Close the oxygen valve to continue.',
            finalInstruction: 'Click next to turn on the acetylene valve',
            interaction: { pauseAt: 1.9, hotspot: { x: 0.44354027478690583, y: 0.4376252530111657, w: 0.09626187910513498, h: 0.17113222952023996 }, instruction: 'Close the oxygen valve to continue.' }
        },
        {
            id: 'step4',
            title: 'Setup',
            src: 'images/simulation/4.mp4',
            type: 'video',
            initialInstruction: 'Turn on the acetylene valve before setting the acetylene cylinder’s pressure',
            finalInstruction: 'Click on next to set the pressure of acetylene',
            interaction: { pauseAt: 1.7, hotspot: { x: 0.4744391495613936, y: 0.4333997658625178, w: 0.09626187910513498, h: 0.17113222952023996 }, instruction: 'Turn on the acetylene valve before setting the acetylene cylinder’s pressure' }
        },
        {
            id: 'step5',
            title: 'Setup',
            src: 'images/simulation/5.mp4',
            type: 'video',
            initialInstruction: 'Set the pressure of acetylene cylinder to 3 PSI',
            finalInstruction: 'Click on next to ignite the flame',
            interaction: { pauseAt: 1.6, hotspot: { x: 0.36484440599106716, y: 0.2239508188783387, w: 0.21985737820308607, h: 0.15423028092564836 }, instruction: 'Set the pressure of acetylene cylinder to 3 PSI' }
        },
        {
            id: 'step5_5',
            title: 'Ignition of flame',
            type: 'drag',
            src: 'images/simulation/6.png',
            tool: 'images/simulation/6-tool.png',
            initialInstruction: 'Drag the spark lighter to the torch tip.',
            finalInstruction: 'Now we will observe the different types of flames.',
            interaction: {
                target: { x: 0.408297138221516, y: 0.447313881310034, w: 0.2, h: 0.2 },
                anchor: { x: 0.8, y: 0.15 }, /* Tip of the striker */
                initialPos: { x: 0.1, y: 0.15 },
                tolerance: 80
            }
        },
        {
            id: 'step7',
            title: 'Observation of flames',
            src: 'images/simulation/7.mp4',
            type: 'video',
            initialInstruction: 'Introduce oxygen to obtain carburizing flame',
            finalInstruction: 'Carburizing flame\nThis flame has a longer, brighter inner cone and a feathery middle cone. It adds carbon to the metal and is suitable for welding high-carbon steels, lead, and aluminum where oxidation must be avoided.\n\nClick next to obtain and study neutral flame.',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Introduce oxygen to obtain carburizing flame' }
        },
        {
            id: 'step8',
            title: 'Observation of flames',
            src: 'images/simulation/8.mp4',
            type: 'video',
            initialInstruction: 'Increase oxygen to obtain neutral flame',
            finalInstruction: 'Neutral flame\nThis flame has a well-defined inner luminous cone and an outer envelope. It has a temperature around 3300°C and does not oxidize or carburize the metal. It is ideal for welding steels and cast iron.\n\nClick next to obtain and study oxidizing flame.',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Increase oxygen to obtain neutral flame' }
        },
        {
            id: 'step9',
            title: 'Observation of flames',
            src: 'images/simulation/9.mp4',
            type: 'video',
            initialInstruction: 'Increase oxygen to obtain oxidizing flame',
            finalInstruction: 'Oxidizing flame\nThis flame has a shorter, sharp inner cone and a loud hissing sound. It is hotter than the neutral flame and is used for cutting and welding metals like brass or bronze that require oxidation.\n\nClick on next to extinguish the flame',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Increase oxygen to obtain oxidizing flame' }
        },
        {
            id: 'step10',
            title: 'Cleanup',
            src: 'images/simulation/10.mp4',
            type: 'video',
            initialInstruction: 'Close oxygen valve',
            finalInstruction: 'Click on next to close the acetylene valve.',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Close oxygen valve' }
        },
        {
            id: 'step11',
            title: 'Cleanup',
            src: 'images/simulation/11.mp4',
            type: 'video',
            initialInstruction: 'Close acetylene valve',
            finalInstruction: 'Click on next to view result.',
            interaction: { pauseAt: 0, hotspot: { x: 0.8342696189111698, y: 0.67396520020934, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Close acetylene valve' }
        },
        {
            id: 'step12',
            title: 'Result',
            type: 'result'
        }
    ];

    let currentStepIndex = 0;
    const totalSteps = steps.length;

    if (stepsList) {
        stepsList.innerHTML = '';
        steps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'step-item';
            item.dataset.step = index + 1;
            const titleDiv = document.createElement('div');
            titleDiv.className = 'step-item-title';
            titleDiv.innerHTML = `<h4 style="margin:0">${index + 1}. ${step.title}</h4>`;
            item.appendChild(titleDiv);
            item.addEventListener('click', () => {
                currentStepIndex = index;
                showCurrentStep();
            });
            stepsList.appendChild(item);
        });
    }

    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) { }
            cleanupCurrent = null;
        }
        window.removeEventListener('resize', updateScaling);
    }

    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage') || document.getElementById('drag-stage');

        if (!container || !wrapper || !stage) return;

        // Reset scale for measurement
        wrapper.style.transform = 'scale(1)';

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            if (scale < 1) {
                wrapper.style.transform = `scale(${scale})`;
            }
        }
    }

    function isInteractiveStep(stepId) {
        return stepId === 'step1' || stepId === 'step3' || stepId === 'step5' || stepId === 'step5_5' || stepId === 'step7';
    }

    function isInteractiveCompleted(stepId) {
        switch (stepId) {
            case 'step1': return step1Completed;
            case 'step3': return step3Completed;
            case 'step5': return step5Completed;
            case 'step5_5': return step5_5Completed;
            case 'step7': return step7Completed;
            default: return true;
        }
    }

    function setInteractiveCompleted(stepId, done) {
        switch (stepId) {
            case 'step1': step1Completed = done; break;
            case 'step3': step3Completed = done; break;
            case 'step5': step5Completed = done; break;
            case 'step5_5': step5_5Completed = done; break;
            case 'step7': step7Completed = done; break;
        }
    }

    const apparatusData = [
        {
            name: "Oxy-acetylene welding torch",
            img: "images/simulation/torch.png",
            desc: "Used to mix oxygen and acetylene in controlled proportions to produce different welding flames."
        },
        {
            name: "Oxygen cylinder",
            img: "images/simulation/oxygen cylinder.png",
            desc: "Supplies pure oxygen at high pressure to support combustion."
        },
        {
            name: "Acetylene cylinderr",
            img: "images/simulation/acetylene cylinderr.png",
            desc: "Provides acetylene fuel gas for flame generation, stored safely in dissolved form."
        },
        {
            name: "Pressure regulator",
            img: "images/simulation/regulator.png",
            desc: "Reduces and maintains safe working pressure of gases supplied from cylinders."
        },
        {
            name: "Spark lighter (striker)",
            img: "images/simulation/striker.png",
            desc: "Used to ignite acetylene gas safely without an open flame."
        }
    ];


    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();

        clearCleanup();
        if (step.type === 'apparatus') {
            renderApparatusStep();
        }
        else if (step.type === 'gif') {
            renderGifStep(step, timestamp);
        } else if (step.type === 'drag') {
            renderDragStep(step, timestamp);
        } else if (step.type === 'result') {
            renderResultStep();
        } else {
            renderInteractiveVideoStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) {
            // nextButton.disabled = (currentStepIndex === totalSteps - 1) || (isInteractiveStep(step.id) && !isInteractiveCompleted(step.id));
            nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active');
                else itm.classList.remove('active');
            });
        }
    }

    function renderGifStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div id="play-stage" style="display: flex; align-items: center; justify-content: center;">
                            <img id="step-gif" src="${formatSrc(step.src, timestamp)}" class="step-gif" alt="${step.title}" style="width: 100%; height: auto;">
                        </div>
                    </div>
                </div>
                <div class="drag-instructions">${step.initialInstruction}</div>
            </div>
        `;
        const gif = document.getElementById('step-gif');
        gif.addEventListener('load', () => {
            updateScaling();
            window.addEventListener('resize', updateScaling);
        });
    }

    function renderApparatusStep() {
        if (nextButton) nextButton.disabled = false;

        let apparatusHTML = '';

        apparatusData.forEach(item => {
            apparatusHTML += `
            <div style="
                background:#f5f5f5;
                border-radius:12px;
                padding:15px;
                text-align:center;
                width: calc(33.33% - 20px);
                min-width: 250px;
                flex: 0 1 auto;
                box-sizing: border-box;
            ">
                <div class="apparatus-img-box">
                    <img src="${getAssetSrc(item.img)}" alt="${item.name}">
                </div>
                <h4 style="margin: 10px 0 6px;">${item.name}</h4>
                <p style="font-size: 14px;">${item.desc}</p>
            </div>
        `;
        });

        gifContainer.innerHTML = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">Step 1 of ${totalSteps}</div>

            <div class="sim-media-container">
                <div class="scaling-wrapper">
                    <div id="play-stage" style="
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 20px;
                        margin-top: 20px;
                        padding: 20px;
                    ">
                        ${apparatusHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
        updateScaling();
        window.addEventListener('resize', updateScaling);
    }


    function renderDragStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="drag-stage">
                            <img src="${formatSrc(step.src, timestamp)}" alt="Background" class="stage-bg" id="drag-bg"/>
                            <img src="${formatSrc(step.tool, timestamp)}" alt="Tool" id="draggable-tool" class="draggable" style="width: 20%; cursor:grab;"/>
                            <div id="drop-zone" class="drop-zone" aria-hidden="true" style="--arrow-top: -210%; --arrow-left: -140%;"></div>
                        </div>
                    </div>
                </div>
                <div class="drag-instructions" id="drag-instruction" style="white-space: pre-line;">${step.initialInstruction}</div>
            </div>`;

        const stage = document.getElementById('drag-stage');
        const tool = document.getElementById('draggable-tool');
        const dropZone = document.getElementById('drop-zone');
        const instructionElem = document.getElementById('drag-instruction');
        const rect = stage.getBoundingClientRect(); // Simplified, might need resize handler

        // Layout Drop Zone
        function layoutDropZone() {
            if (!stage) return;
            const r = stage.getBoundingClientRect();
            const tx = stage.offsetWidth * step.interaction.target.x;
            const ty = stage.offsetHeight * step.interaction.target.y;
            // Actually let's use a fixed size dropzone
            const dzSize = 80;
            dropZone.style.width = dzSize + 'px';
            dropZone.style.height = dzSize + 'px';
            dropZone.style.left = (tx - dzSize / 2) + 'px';
            dropZone.style.top = (ty - dzSize / 2) + 'px';
        }

        const dragBg = document.getElementById('drag-bg');
        dragBg.addEventListener('load', () => {
            layoutDropZone();
            updateScaling();
            window.addEventListener('resize', updateScaling);
        });
        if (dragBg.complete) {
            layoutDropZone();
            updateScaling();
            window.addEventListener('resize', updateScaling);
        }

        let dragging = false;
        let startX, startY, initialLeft, initialTop;

        tool.onmousedown = dragStart;
        tool.ontouchstart = dragStart;

        // Position tool initially
        if (step.interaction && step.interaction.initialPos) {
            tool.style.left = (step.interaction.initialPos.x * 100) + '%';
            tool.style.top = (step.interaction.initialPos.y * 100) + '%';
        } else {
            tool.style.left = '80%';
            tool.style.top = '20%';
        }

        function dragStart(e) {
            e.preventDefault();
            dragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            initialLeft = tool.offsetLeft;
            initialTop = tool.offsetTop;
            document.onmousemove = dragMove;
            document.ontouchmove = dragMove;
            document.onmouseup = dragEnd;
            document.ontouchend = dragEnd;
            tool.style.cursor = 'grabbing';
            // Hide only the arrow as soon as dragging starts
            dropZone.classList.add('dragging-active');
        }

        function dragMove(e) {
            if (!dragging) return;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;
            tool.style.left = (initialLeft + dx) + 'px';
            tool.style.top = (initialTop + dy) + 'px';
        }

        function dragEnd() {
            dragging = false;
            document.onmousemove = null;
            document.ontouchmove = null;
            document.onmouseup = null;
            document.ontouchend = null;
            tool.style.cursor = 'grab';

            // Re-show arrow (REMOVED: it should stay hidden)
            // dropZone.classList.remove('arrow-hidden');

            checkDrop();
        }

        function checkDrop() {
            const toolRect = tool.getBoundingClientRect();
            const zoneRect = dropZone.getBoundingClientRect();
            const anchor = step.interaction.anchor || { x: 0.5, y: 0.5 };

            // Calculate tool anchor point absolute position
            const toolAx = toolRect.left + toolRect.width * anchor.x;
            const toolAy = toolRect.top + toolRect.height * anchor.y;

            // Calculate zone center absolute position
            const zoneCx = zoneRect.left + zoneRect.width / 2;
            const zoneCy = zoneRect.top + zoneRect.height / 2;

            const dist = Math.hypot(toolAx - zoneCx, toolAy - zoneCy);

            if (dist < (step.interaction.tolerance || 80)) {
                // Snapped
                // Calculate new top/left to align anchor with zone center
                // zoneCx = newLeft + toolWidth * anchorX
                // newLeft = zoneCx - toolWidth * anchorX
                // RELATIVE to parent stage:
                // We need to set style.left/top relative to stage.
                // zoneCenterRelX = dropZone.offsetLeft + dropZone.offsetWidth/2
                // toolNewLeft = zoneCenterRelX - tool.offsetWidth * anchor.x

                const zoneCenterRelX = dropZone.offsetLeft + dropZone.offsetWidth / 2;
                const zoneCenterRelY = dropZone.offsetTop + dropZone.offsetHeight / 2;

                tool.style.left = (zoneCenterRelX - tool.offsetWidth * anchor.x) + 'px';
                tool.style.top = (zoneCenterRelY - tool.offsetHeight * anchor.y) + 'px';

                tool.onmousedown = null;
                tool.ontouchstart = null;
                tool.style.cursor = 'pointer';
                dropZone.style.display = 'none'; // Hide the whole hotspot when placed correctly

                instructionElem.textContent = 'Click the lighter to ignite.';

                setTimeout(() => {
                    tool.onclick = function () {
                        tool.style.display = 'none';
                        document.getElementById('drag-bg').src = getAssetSrc('images/simulation/6.1.png');
                        instructionElem.textContent = step.finalInstruction;
                        setInteractiveCompleted(step.id, true);
                        if (nextButton) nextButton.disabled = false;
                        tool.onclick = null;
                        tool.style.cursor = 'default';
                    };
                }, 100);
            }
        }

        cleanupCurrent = function () {
            // Drop zone resize handled by updateScaling if needed
        };
    }

    function renderInteractiveVideoStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        const cfg = step.interaction || { pauseAt: 2.0, hotspot: { x: 0.45, y: 0.45, w: 0.30, h: 0.30 } };

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formatSrc(step.src, timestamp)}" style="width:100%; height:auto;" playsinline muted></video>
                            <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;">${step.initialInstruction}</div>
            </div>
        `;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        // Audio source node for step 9
        let hissSource = null;

        if (step.id === 'step9') {
            // Initialize audio context and load buffer
            initAudio().catch(console.error);
        }

        function layoutHotspot() {
            if (!stage) return;
            const w = stage.offsetWidth;
            const h = stage.offsetHeight;
            hotspot.style.left = (w * cfg.hotspot.x) + 'px';
            hotspot.style.top = (h * cfg.hotspot.y) + 'px';
            hotspot.style.width = (w * cfg.hotspot.w) + 'px';
            hotspot.style.height = (h * cfg.hotspot.h) + 'px';
        }

        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedOnce = false;

        function maybePause() {
            if (pausedOnce) return;
            if (video.currentTime + EPS >= cfg.pauseAt) {
                pausedOnce = true;
                video.pause();
                instructionElem.textContent = cfg.instruction;
                layoutHotspot();
                hotspot.style.display = 'block';
                hotspot.classList.add('debug-highlight');
            }
        }

        function frameCallback() {
            maybePause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        function onPlay() {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(maybePause, 16);
            }
        }

        function onPause() {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function onEnded() {
            setInteractiveCompleted(step.id, true);
            instructionElem.textContent = step.finalInstruction;
            if (nextButton) nextButton.disabled = false;

            // Play hiss sound on seamless loop for step 9
            // Play hiss sound on seamless loop for step 9 using Web Audio API
            if (step.id === 'step9' && audioCtx && hissBuffer) {
                try {
                    // Resume context just in case
                    if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }

                    hissSource = audioCtx.createBufferSource();
                    hissSource.buffer = hissBuffer;
                    hissSource.loop = true;
                    hissSource.connect(audioCtx.destination);
                    hissSource.start(0);
                } catch (e) {
                    console.error('Error playing Web Audio:', e);
                }
            }
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', () => {
            hotspot.style.display = 'none';
            video.play();
        }, { once: true });

        window.addEventListener('resize', () => { layoutHotspot(); updateScaling(); });
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();

            // Pre-load audio for step 9 to ensure seamless playback
            // Pre-load audio for step 9
            if (step.id === 'step9') {
                initAudio();
            }

            video.play().catch(() => { });
        }, { once: true });

        cleanupCurrent = function () {
            try {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
            } catch (_) { }
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId);
                rafId = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            // Stop and cleanup hiss audio when leaving step 9
            // Stop and cleanup hiss audio when leaving step 9
            if (hissSource) {
                try {
                    hissSource.stop();
                    hissSource.disconnect();
                    hissSource = null;
                } catch (e) {
                    // Ignore errors if already stopped
                }
            }
        };
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                showCurrentStep();
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
    }
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            location.reload();
        });
    }

    // Start with preloading
    preloadAssets();

    function renderResultStep() {
        if (nextButton) nextButton.disabled = true;

        const flames = [
            {
                name: 'Carburizing Flame',
                img: 'images/carbrizing flame.png', // Using video thumbnails or screenshots if available, else video
                desc: 'This flame has a longer, brighter inner cone and a feathery middle cone. It adds carbon to the metal.',
                app: 'Welding high-carbon steels, lead, and aluminum where oxidation must be avoided.'
            },
            {
                name: 'Neutral Flame',
                img: 'images/neutral flame.png',
                desc: 'This flame has a well-defined inner luminous cone and an outer envelope. Temperature around 3300°C.',
                app: 'Ideal for welding steels and cast iron. Does not oxidize or carburize the metal.'
            },
            {
                name: 'Oxidizing Flame',
                img: 'images/oxidising flame.png',
                desc: 'This flame has a shorter, sharp inner cone and a loud hissing sound. It is hotter than the neutral flame.',
                app: 'Used for cutting and welding metals like brass or bronze that require oxidation.'
            }
        ];

        let tableRows = '';
        flames.forEach(f => {
            // Using video as image/thumbnail if static image not available, or just use the video element
            tableRows += `
                <tr>
                    <td style="text-align:center;">
                        <strong>${f.name}</strong><br>
                        <img src="${getAssetSrc(f.img)}" style="width:235px;">
                    </td>
                    <td>${f.desc}</td>
                    <td>${f.app}</td>
                </tr>
            `;
        });

        gifContainer.innerHTML = `
            <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
                <h2 style="text-align:center;">Experiment Result: Types of Flames</h2>
                <hr>
                
                <table border="1" width="100%" cellpadding="8" style="border-collapse:collapse; margin-top:20px;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th width="30%">Flame Type</th>
                            <th width="40%">Description</th>
                            <th width="30%">Applications</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">🖨 Print Results</button>
                </div>
            </div>
        `;
        if (resetButton) {
            resetButton.onclick = () => {
                location.reload();
            };
        }
    }
});
