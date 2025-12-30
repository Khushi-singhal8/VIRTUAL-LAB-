document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E4 script loaded');

    // Inject CSS for apparatus image sizing
    const style = document.createElement('style');
    style.innerHTML = `
.apparatus-img-box {
    width: 280px;
    height: 280px;
    margin: 20px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.apparatus-img-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
`;
    document.head.appendChild(style);


    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

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
            interaction: { pauseAt: 1.4, hotspot: { x: 0.4504105207511871, y: 0.42888694558776186, w: 0.07724718693621943, h: 0.13732833233105676 }, instruction: 'Turn on the oxygen valve before setting the oxygen cylinder’s pressure' }
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
            initialInstruction: 'Click the oxygen valve to continue.',
            finalInstruction: 'Click next to turn on the acetylene valve',
            interaction: { pauseAt: 1.9, hotspot: { x: 0.44354027478690583, y: 0.4376252530111657, w: 0.09626187910513498, h: 0.17113222952023996 }, instruction: 'Click the oxygen valve to continue.' }
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
            finalInstruction: 'Click on next to close ignite the flame',
            interaction: { pauseAt: 1.5, hotspot: { x: 0.36484440599106716, y: 0.2239508188783387, w: 0.21985737820308607, h: 0.15423028092564836 }, instruction: 'Click near the torch control to continue.' }
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
            finalInstruction: 'Step complete!',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Introduce oxygen to obtain carburizing flame' }
        },
        {
            id: 'step8',
            title: 'Observation of flames',
            src: 'images/simulation/8.mp4',
            type: 'video',
            initialInstruction: 'Increase oxygen to obtain neutral flame',
            finalInstruction: 'Step complete!',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Increase oxygen to obtain neutral flame' }
        },
        {
            id: 'step9',
            title: 'Observation of flames',
            src: 'images/simulation/9.mp4',
            type: 'video',
            initialInstruction: 'Increase oxygen to obtain oxidizing flame',
            finalInstruction: 'Step complete!',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Increase oxygen to obtain oxidizing flame' }
        },
        {
            id: 'step10',
            title: 'Cleanup',
            src: 'images/simulation/10.mp4',
            type: 'video',
            initialInstruction: 'Close oxygen valve',
            finalInstruction: 'Step complete!',
            interaction: { pauseAt: 0, hotspot: { x: 0.7463266676299354, y: 0.6095265211924596, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Close oxygen valve' }
        },
        {
            id: 'step11',
            title: 'Cleanup',
            src: 'images/simulation/11.mp4',
            type: 'video',
            initialInstruction: 'Close acetylene valve',
            finalInstruction: 'Step complete!',
            interaction: { pauseAt: 0, hotspot: { x: 0.8342696189111698, y: 0.67396520020934, w: 0.043971475640617215, h: 0.07817151224998616 }, instruction: 'Close acetylene valve' }
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
                <div style="height: 400px; display: flex; align-items: center; justify-content: center;">
                    <img src="${step.src}?t=${timestamp}" class="step-gif" alt="${step.title}">
                </div>
                <div class="drag-instructions">${step.initialInstruction}</div>
            </div>
        `;
    }

    function renderApparatusStep() {
        if (nextButton) nextButton.disabled = true;

        let optionsHTML = `<option value="">-- Select Apparatus --</option>`;
        apparatusData.forEach((a, i) => {
            optionsHTML += `<option value="${i}">${a.name}</option>`;
        });

        gifContainer.innerHTML = `
        <div class="gif-wrapper">
            <h3>Apparatus Used</h3>
            <div class="step-indicator">Step 1 of ${totalSteps}</div>

            <select id="apparatus-select" style="padding:10px;width:60%;margin-bottom:20px;">
                ${optionsHTML}
            </select>

            <div id="apparatus-display" style="display:none;">
                <div class="apparatus-img-box">
    <img id="apparatus-img">
</div>

                <p id="apparatus-desc" style="font-size:16px;text-align:center;"></p>
            </div>
        </div>
    `;

        const select = document.getElementById('apparatus-select');
        const display = document.getElementById('apparatus-display');
        const img = document.getElementById('apparatus-img');
        const desc = document.getElementById('apparatus-desc');

        select.addEventListener('change', () => {
            if (!select.value) {
                display.style.display = "none";
                nextButton.disabled = true;
                return;
            }

            const item = apparatusData[select.value];
            img.src = item.img;
            desc.textContent = item.desc;
            display.style.display = "block";
            nextButton.disabled = false;
        });
    }


    function renderDragStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="drag-stage" id="drag-stage">
                    <img src="${step.src}?t=${timestamp}" alt="Background" class="stage-bg" id="drag-bg"/>
                    <img src="${step.tool}?t=${timestamp}" alt="Tool" id="draggable-tool" class="draggable" style="width: 20%; cursor:grab;"/>
                    <div id="drop-zone" class="drop-zone" aria-hidden="true"></div>
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
            const r = stage.getBoundingClientRect();
            const tx = r.width * step.interaction.target.x;
            const ty = r.height * step.interaction.target.y;
            const w = r.width * step.interaction.target.w;
            const h = r.height * step.interaction.target.h; // Use estimates
            // Actually let's use a fixed size dropzone
            const dzSize = 80;
            dropZone.style.width = dzSize + 'px';
            dropZone.style.height = dzSize + 'px';
            dropZone.style.left = (tx - dzSize / 2) + 'px';
            dropZone.style.top = (ty - dzSize / 2) + 'px';
        }

        setTimeout(layoutDropZone, 100); // Wait for layout
        window.addEventListener('resize', layoutDropZone);

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
                dropZone.style.display = 'none';

                instructionElem.textContent = 'Click the lighter to ignite.';

                setTimeout(() => {
                    tool.onclick = function () {
                        tool.style.display = 'none';
                        document.getElementById('drag-bg').src = 'images/simulation/6.1.png';
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
            window.removeEventListener('resize', layoutDropZone);
        };
    }

    function renderInteractiveVideoStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        const cfg = step.interaction || { pauseAt: 2.0, hotspot: { x: 0.45, y: 0.45, w: 0.30, h: 0.30 } };

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions">${step.initialInstruction}</div>
            </div>
        `;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        function layoutHotspot() {
            const rect = stage.getBoundingClientRect();
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
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
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', () => {
            hotspot.style.display = 'none';
            video.play();
        }, { once: true });

        window.addEventListener('resize', layoutHotspot);
        video.addEventListener('loadedmetadata', () => {
            layoutHotspot();
            video.play().catch(() => { });
        }, { once: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('resize', layoutHotspot);
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

    showCurrentStep();
});