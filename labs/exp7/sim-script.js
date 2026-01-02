document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E5 script loaded');

    const resetButton = document.getElementById('reset-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;
    let step2Completed = false;
    let step3Completed = false;
    let step4Completed = false;
    let step6Completed = false;

    const steps = [
        { id: 'step1', title: 'Clean plate edges with file', src: 'images/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Align plates and clamp them', src: 'images/simulation/2.mp4', type: 'video' },
        { id: 'step3', title: 'Ignite flame', src: 'images/simulation/3.mp4', type: 'video' },
        { id: 'step4', title: 'Apply small tack welds at both ends of the plates', src: 'images/simulation/4.mp4', type: 'video' },
        { id: 'step5', title: 'Use a chipping hammer to remove slag', src: 'images/simulation/5.mp4', type: 'video' },
        { id: 'step6', title: 'Use a file to dress the weld bead and edges', src: 'images/simulation/6.mp4', type: 'video' }
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
            item.setAttribute('aria-disabled', 'true');
            item.style.cursor = 'default';
            item.title = 'Use Previous/Next to navigate';
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
        return stepId === 'step2' || stepId === 'step3' || stepId === 'step4' || stepId === 'step6';
    }

    function isInteractiveCompleted(stepId) {
        if (stepId === 'step2') return step2Completed;
        if (stepId === 'step3') return step3Completed;
        if (stepId === 'step4') return step4Completed;
        if (stepId === 'step6') return step6Completed;
        return true;
    }

    function setInteractiveCompleted(stepId, done) {
        if (stepId === 'step2') step2Completed = done;
        if (stepId === 'step3') step3Completed = done;
        if (stepId === 'step4') step4Completed = done;
        if (stepId === 'step6') step6Completed = done;
    }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();

        clearCleanup();

        if (step.id === 'step2' || step.id === 'step3' || step.id === 'step4') {
            renderInteractiveVideoStep(step, timestamp);
        } else if (step.id === 'step6') {
            renderStep6DragDrop(step, timestamp);
        } else {
            renderPlainVideoStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) {
            // Temporarily enable next button always for testing
            nextButton.disabled = (currentStepIndex === totalSteps - 1);
            // nextButton.disabled = (currentStepIndex === totalSteps - 1) || (isInteractiveStep(step.id) && !isInteractiveCompleted(step.id));
        }

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active');
                else itm.classList.remove('active');
            });
        }
    }

    function renderPlainVideoStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                </div>
            </div>
        `;

        const video = document.getElementById('step-video');
        const onMeta = () => {
            video.play().catch(() => { });
        };
        video.addEventListener('loadedmetadata', onMeta, { once: true });

        cleanupCurrent = function () {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.removeEventListener('loadedmetadata', onMeta);
            } catch (_) { }
        };
    }

    function renderInteractiveVideoStep(step, timestamp) {
        setInteractiveCompleted(step.id, false);
        if (nextButton) nextButton.disabled = true;

        let cfgSeq;
        if (step.id === 'step2') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.3433333333333333, y: 0.5251851851851852, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the first plate.' },
                { pauseAt: 1.95, hotspot: { x: 0.7144444444444444, y: 0.591604938271605, w: 0.08, h: 0.14222222222222222 }, instruction: 'Click here to align the second plate.' }
            ];
        } else if (step.id === 'step3') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.40518, y: 0.24, w: 0.0623, h: 0.112 }, instruction: 'Set pressure for acetylene to 120kPa' },
                { pauseAt: 3.13, hotspot: { x: 0.5353154710458081, y: 0.328790715087982, w: 0.07554019014693172, h: 0.1052190190939723 }, instruction: 'Set pressure for oxygen to 250kPa.' },
                { pauseAt: 6.36, hotspot: { x: 0.41109766637856526, y: 0.33198053163609137, w: 0.045168539325842694, h: 0.07922875327592663 }, instruction: 'Open acetylene valve slightly.' },
                { pauseAt: 11.26, hotspot: { x: 0.23823681936041485, y: 0.1612579558217896, w: 0.053811581676750216, h: 0.19304380381879446 }, instruction: 'Ignite flame.' },
                { pauseAt: 19.33, hotspot: { x: 0.46641313742437335, y: 0.37990265818045676, w: 0.053811581676750216, h: 0.10618494945713217 }, instruction: 'Add oxygen to achieve neutral flame.' }
            ];
        } else if (step.id === 'step4') {
            cfgSeq = [
                { pauseAt: 0, hotspot: { x: 0.44, y: 0.717283950617284, w: 0.042222222222222223, h: 0.07506172839506173 }, instruction: 'Click here to apply tack weld at the first end.' },
                { pauseAt: 5.8, hotspot: { x: 0.4722222222222222, y: 0.6185185185185185, w: 0.042222222222222223, h: 0.07506172839506173 }, instruction: 'Click here to apply tack weld at the second end.' }
            ];
        }

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%; height:100%;" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>
        `;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        let segmentIndex = 0;
        let rafId = null;
        let intervalId = null;
        const EPS = 0.01;
        let pausedForSegment = false;

        function layoutHotspot() {
            const rect = stage.getBoundingClientRect();
            const cfg = cfgSeq[Math.min(segmentIndex, cfgSeq.length - 1)];
            hotspot.style.left = (rect.width * cfg.hotspot.x) + 'px';
            hotspot.style.top = (rect.height * cfg.hotspot.y) + 'px';
            hotspot.style.width = (rect.width * cfg.hotspot.w) + 'px';
            hotspot.style.height = (rect.height * cfg.hotspot.h) + 'px';
        }

        function showHotspot() {
            const cfg = cfgSeq[segmentIndex];
            instructionElem.textContent = `${cfg.instruction}`;
            layoutHotspot();
            hotspot.style.display = 'block';
            hotspot.classList.add('debug-highlight');
        }

        function maybePause() {
            if (segmentIndex >= cfgSeq.length || pausedForSegment) return;
            if (video.currentTime + EPS >= cfgSeq[segmentIndex].pauseAt) {
                pausedForSegment = true;
                video.pause();
                showHotspot();
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

        function onHotspotClick() {
            hotspot.style.display = 'none';
            pausedForSegment = false;
            segmentIndex++;
            video.play();
        }

        function onEnded() {
            setInteractiveCompleted(step.id, true);
            instructionElem.textContent = 'Step complete!';
            if (nextButton) nextButton.disabled = false;
        }

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded, { once: true });
        hotspot.addEventListener('click', onHotspotClick);

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
                hotspot.removeEventListener('click', onHotspotClick);
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

    function renderStep6DragDrop(step, timestamp) {
        step6Completed = false;
        if (nextButton) nextButton.disabled = true;

        const videoSrc = 'images/simulation/6.mp4';
        const bgPath = 'images/simulation/6.png';
        const toolPath = 'images/simulation/6-tool.png';

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width: 100%; height: 100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <!-- Drag Phase -->
                <div class="drag-stage" id="step6-drag-stage" style="position: relative; width: 100%; overflow: hidden;">
                    <img src="${bgPath}?t=${timestamp}" class="stage-bg" style="width: 100%; height: auto; display: block;"/>
                    <img src="${toolPath}?t=${timestamp}" id="draggable-file" class="draggable" style="position: absolute; z-index: 20; cursor: grab; width: 37%; top: 10%; right: 10%;"/>
                    <div id="step6-drop-zone" class="drop-zone" aria-hidden="true" style="position: absolute; border: 2px dashed rgba(255, 255, 0, 0.7); background: rgba(255, 255, 0, 0.2); border-radius: 50%; z-index: 5;"></div>
                </div>

                <!-- Video Phase -->
                <div class="play-stage" id="step6-play-stage" style="position: relative; width: 100%; height: 100%; display: none;">
                    <video id="step6-video" src="${videoSrc}?t=${timestamp}" style="width:100%; height:auto;" playsinline muted></video>
                </div>
                
                <div id="step6-instruction" class="drag-instructions">Drag the file to the weld bead.</div>
            </div>
        `;

        const dragStage = document.getElementById('step6-drag-stage');
        const fileTool = document.getElementById('draggable-file');
        const dropZone = document.getElementById('step6-drop-zone');
        const dragBg = dragStage.querySelector('.stage-bg');

        const playStage = document.getElementById('step6-play-stage');
        const video = document.getElementById('step6-video');
        const instructionElem = document.getElementById('step6-instruction');

        // Drop zone target (adjust x and y for the weld bead location)
        const targetRel = {x: 0.5, y: 0.85};
        const tolerancePx = 60;

        function setDropZoneLayout() {
            const rect = dragStage.getBoundingClientRect();
            const w = rect.width * 0.08;
            const h = w;
            const tx = rect.width * targetRel.x;
            const ty = rect.height * targetRel.y;
            dropZone.style.width = w + 'px';
            dropZone.style.height = h + 'px';
            dropZone.style.left = (tx - w / 2) + 'px';
            dropZone.style.top = (ty - h / 2) + 'px';
        }

        if (dragBg.complete && dragBg.naturalWidth) setDropZoneLayout();
        else dragBg.onload = setDropZoneLayout;
        window.addEventListener('resize', setDropZoneLayout);

        // Drag Logic
        let dragging = false;
        let startX = 0, startY = 0;

        function onPointerDown(e) {
            dragging = true;
            fileTool.classList.add('dragging');
            const rect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);

            let newLeft = clientX - stageRect.left - startX;
            let newTop = clientY - stageRect.top - startY;

            newLeft = Math.max(0, Math.min(newLeft, stageRect.width - fileRect.width));
            newTop = Math.max(0, Math.min(newTop, stageRect.height - fileRect.height));

            fileTool.style.left = newLeft + 'px';
            fileTool.style.top = newTop + 'px';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            fileTool.classList.remove('dragging');

            const stageRect = dragStage.getBoundingClientRect();
            const fileRect = fileTool.getBoundingClientRect();
            const fileCenter = {
                x: fileRect.left - stageRect.left + fileRect.width / 2,
                y: fileRect.top - stageRect.top + fileRect.height / 2
            };

            const dzRect = dropZone.getBoundingClientRect();
            const targetX = dzRect.left - stageRect.left + dzRect.width / 2;
            const targetY = dzRect.top - stageRect.top + dzRect.height / 2;

            const dist = Math.hypot(fileCenter.x - targetX, fileCenter.y - targetY);

            if (dist < tolerancePx) {
                dropZone.classList.add('success');
                setTimeout(startVideoPhase, 500);
            }
        }

        fileTool.addEventListener('mousedown', onPointerDown);
        fileTool.addEventListener('touchstart', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function startVideoPhase() {
            // Cleanup drag listeners
            window.removeEventListener('resize', setDropZoneLayout);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchend', onPointerUp);

            dragStage.style.display = 'none';
            playStage.style.display = 'block';
            instructionElem.textContent = "Dressing the weld bead...";

            video.onended = () => {
                instructionElem.textContent = "Step complete!";
                step6Completed = true;
                if (nextButton) nextButton.disabled = false;
            };
            video.play();
        }

        cleanupCurrent = () => {
            try {
                window.removeEventListener('resize', setDropZoneLayout);
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('touchmove', onPointerMove);
                window.removeEventListener('mouseup', onPointerUp);
                window.removeEventListener('touchend', onPointerUp);
            } catch (_) { }
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
        resetButton.onclick = () => {
            location.reload();
        };
    }

    showCurrentStep();
});