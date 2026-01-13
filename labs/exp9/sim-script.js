document.addEventListener("DOMContentLoaded", function() {
    console.log('Simulation E9 script loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const steps = [
        { id: 'step1', mode: 'drag', title: 'Place workpiece on apparatus (drag & drop).',
            background: 'images/simulation/1.png', tool: 'images/simulation/1-tool.png',
            target: { mode: 'rel', x: 0.48, y: 0.67 },        
            init:   { mode: 'rel', x: 0.82, y: 0.30 },       
            anchor: { x: 0.5, y: 0.5 }, 
            toolSize: { widthRel: 0.27 },
            tolerance: 55,
            instruction: 'Drag the workpiece onto the marked location on the apparatus.' },
        { id: 'step2', mode: 'drag', title: 'Setup handle on apparatus (drag & drop).',
            background: 'images/simulation/2.png', tool: 'images/simulation/2-tool.png',
            target: { mode: 'rel', x: 0.46, y: 0.44 },   
            init:   { mode: 'rel', x: 0.80, y: 0.25 },
            anchor: { x: 0.25, y: 0.2 },            
            toolSize: { widthRel: 0.30 },
            tolerance: 55,
            instruction: 'Drag the handle so its hinge (top-left) snaps into place.' },
        { id: 'step3', mode: 'hotspot', title: 'Start operation and measure angle', src: 'images/simulation/3.mp4' },
        { id: 'step4', mode: 'hotspot', title: 'Remove punch and measure angle', src: 'images/simulation/4.mp4' }
    ];

    const angleTextByStep = {
        step3: 'Angle: 106°',
        step4: 'Angle: 112°'
    };

        const hotspotSteps = new Set(['step3','step4']);
        const stepCompleted = Object.fromEntries(steps.map(s => [s.id, s.mode !== 'drag' && !hotspotSteps.has(s.id)]));

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
            item.setAttribute('aria-disabled','true');
            item.style.cursor = 'default';
            item.title = 'Use Previous/Next to navigate';
            stepsList.appendChild(item);
        });
    }

    if (totalStepsElement) totalStepsElement.textContent = totalSteps;

    function clearCleanup() {
        if (typeof cleanupCurrent === 'function') {
            try { cleanupCurrent(); } catch (_) {}
            cleanupCurrent = null;
        }
    }

    function isHotspotStep(step) { return step.mode === 'hotspot' && hotspotSteps.has(step.id); }
    function isHotspotDone(step) { return stepCompleted[step.id]; }
    function setStepDone(stepId) { if (stepCompleted.hasOwnProperty(stepId)) stepCompleted[stepId] = true; }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (step.mode === 'drag') {
            renderDragStep(step, timestamp);
        } else if (isHotspotStep(step)) {
            renderHotspotFirstFrame(step, timestamp);
        } else {
            renderAutoplayStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
    if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1) || !isHotspotDone(step);

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderHotspotFirstFrame(step, timestamp) {
        const hotspotMap = {
            step3: {x: 0.5274019014693172, y: 0.5347330587794833, w: 0.07376974935177183, h: 0.12618494945713216, instruction:'Press handle to start process.' },
            step4: {x: 0.4997579948141746, y: 0.4199985024335455, w: 0.0486257562662057, h: 0.09517034818420067, instruction:'Press handle to start process.' }
        };
        const cfg = hotspotMap[step.id] || { x:0.45, y:0.45, w:0.15, h:0.15, instruction:'Click to continue.' };

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" preload="auto" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        function layoutHotspot() {
            const rect = stage.getBoundingClientRect();
            hotspot.style.left = (rect.width * cfg.x) + 'px';
            hotspot.style.top = (rect.height * cfg.y) + 'px';
            hotspot.style.width = (rect.width * cfg.w) + 'px';
            hotspot.style.height = (rect.height * cfg.h) + 'px';
        }

        function showHotspot() {
            instructionElem.textContent = cfg.instruction;
            layoutHotspot();
            hotspot.style.display = 'block';
            hotspot.classList.add('debug-highlight');
        }

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 0.01;
            video.pause();
            showHotspot();
        }, { once: true });

        hotspot.addEventListener('click', () => {
            hotspot.style.display = 'none';
            setStepDone(step.id);
            instructionElem.textContent = '  ';
            video.play().catch(()=>{});
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        video.addEventListener('ended', () => {
            if (angleTextByStep[step.id]) {
                instructionElem.textContent = angleTextByStep[step.id];
            } else {
                instructionElem.textContent = 'Step complete.';
            }
        }, { once: true });

        window.addEventListener('resize', layoutHotspot);

        cleanupCurrent = function() {
            try { window.removeEventListener('resize', layoutHotspot); } catch(_) {}
        };
    }

    function renderAutoplayStep(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('step-video');
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(()=>{});
        }, { once: true });

        video.addEventListener('ended', () => {
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        cleanupCurrent = function() {
            try { video.pause(); video.removeAttribute('src'); video.load(); } catch(_) {}
        };
    }

    function renderDragStep(step, timestamp) {
        stepCompleted[step.id] = false;
        if (nextButton) nextButton.disabled = true;

        const backgroundPng = step.background;
        const toolPng = step.tool;
        const tolerancePx = step.tolerance || 50;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="drag-stage" id="drag-stage">
                    <img src="${backgroundPng}?t=${timestamp}" alt="Background" class="stage-bg" id="drag-bg"/>
                    <img src="${toolPng}?t=${timestamp}" alt="Tool" id="draggable-tool" class="draggable"/>
                    <div id="drop-zone" class="drop-zone" aria-hidden="true"></div>
                </div>
                <div class="drag-instructions" id="drag-instruction">${step.instruction || 'Drag the tool to the highlighted target.'}</div>
            </div>`;

        const stage = document.getElementById('drag-stage');
        const tool = document.getElementById('draggable-tool');
        const dropZone = document.getElementById('drop-zone');
        const stageBg = document.getElementById('drag-bg');
        let toolPlacedInitially = false;
        let toolMovedByUser = false;

        function getRect() { return stage.getBoundingClientRect(); }

        function getTargetPoint(rect) {
            if (!step.target) return { x: rect.width * 0.5, y: rect.height * 0.5 };
            if (step.target.mode === 'px') return { x: step.target.x, y: step.target.y };
            return { x: rect.width * step.target.x, y: rect.height * step.target.y };
        }

        function placeToolInitial() {
            const rect = getRect();
            let left, top;
            if (step.init && step.init.mode === 'px') { left = step.init.x; top = step.init.y; }
            else if (step.init) { left = rect.width * step.init.x; top = rect.height * step.init.y; }
            else { left = rect.width * 0.8; top = rect.height * 0.2; }
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
            toolPlacedInitially = true;
        }

        function layoutDropZone() {
            const rect = getRect();
            const target = getTargetPoint(rect);
            const dzSize = Math.max(60, Math.min(rect.width, rect.height) * 0.12);
            dropZone.style.width = dzSize + 'px';
            dropZone.style.height = dzSize + 'px';
            dropZone.style.left = (target.x - dzSize/2) + 'px';
            dropZone.style.top = (target.y - dzSize/2) + 'px';
        }

        function resizeStageToImage() {
            const naturalW = stageBg.naturalWidth;
            const naturalH = stageBg.naturalHeight;
            if (!naturalW || !naturalH) return;
            const stageW = stage.clientWidth;
            const newH = Math.round(stageW * (naturalH / naturalW));
            stage.style.height = newH + 'px';
            layoutDropZone();
            applyToolSize();
            if (!toolMovedByUser && !toolPlacedInitially) placeToolInitial();
        }

        function applyToolSize() {
            if (!step.toolSize) return;
            const rect = getRect();
            if (step.toolSize.widthPx) {
                tool.style.width = step.toolSize.widthPx + 'px';
            } else if (step.toolSize.widthRel) {
                tool.style.width = (rect.width * step.toolSize.widthRel) + 'px';
            }
            tool.style.height = 'auto';
        }

        if (stageBg.complete && stageBg.naturalWidth) {
            resizeStageToImage();
            if (!toolMovedByUser && !toolPlacedInitially) placeToolInitial();
        } else {
            stageBg.addEventListener('load', () => {
                resizeStageToImage();
                if (!toolMovedByUser && !toolPlacedInitially) placeToolInitial();
            }, { once: true });
        }
        applyToolSize();

        window.addEventListener('resize', resizeStageToImage, { passive: true });
        layoutDropZone();

        let dragging = false; let offsetX = 0; let offsetY = 0;
        function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

        function pointerDown(e) {
            if (stepCompleted[step.id]) return;
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            offsetX = clientX - toolRect.left;
            offsetY = clientY - toolRect.top;
            dragging = true;
            toolMovedByUser = true;
            tool.classList.add('dragging');
            e.preventDefault();
        }
        function pointerMove(e) {
            if (!dragging || stepCompleted[step.id]) return;
            const rect = getRect();
            const toolRect = tool.getBoundingClientRect();
            const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
            let left = clientX - rect.left - offsetX;
            let top = clientY - rect.top - offsetY;
            left = clamp(left, 0, rect.width - toolRect.width);
            top = clamp(top, 0, rect.height - toolRect.height);
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
        }
        function pointerUp() {
            if (!dragging) return;
            dragging = false;
            tool.classList.remove('dragging');
            checkDrop();
        }

        function centerDistance(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }
        function checkDrop() {
            const rect = getRect();
            const toolRect = tool.getBoundingClientRect();
            const anchor = step.anchor || { x: 0.5, y: 0.5 };
            const toolAnchorPoint = {
                x: toolRect.left - rect.left + toolRect.width * anchor.x,
                y: toolRect.top - rect.top + toolRect.height * anchor.y
            };
            const target = getTargetPoint(rect);
            if (centerDistance(toolAnchorPoint, target) <= tolerancePx) snapToTarget(target, anchor);
        }
        function snapToTarget(target, anchor) {
            const toolRect = tool.getBoundingClientRect();
            const rect = getRect();
            anchor = anchor || (step.anchor || { x: 0.5, y: 0.5 });
            const left = target.x - toolRect.width * anchor.x;
            const top = target.y - toolRect.height * anchor.y;
            tool.style.transition = 'left 0.18s ease, top 0.18s ease';
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';
            setTimeout(()=>{ tool.style.transition=''; }, 250);
            dropZone.classList.add('success');
            stepCompleted[step.id] = true;
            setStepDone(step.id);
            const ok = document.createElement('div');
            ok.className = 'drag-success';
            ok.textContent = 'Placed correctly!';
            stage.appendChild(ok);
            setTimeout(()=> ok.remove(), 1200);
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1) ? true : false;
        }

        tool.addEventListener('mousedown', pointerDown);
        tool.addEventListener('touchstart', pointerDown, { passive: false });
        window.addEventListener('mousemove', pointerMove, { passive: true });
        window.addEventListener('touchmove', pointerMove, { passive: false });
        window.addEventListener('mouseup', pointerUp, { passive: true });
        window.addEventListener('touchend', pointerUp, { passive: true });

        cleanupCurrent = function() {
            try {
                window.removeEventListener('resize', resizeStageToImage);
                window.removeEventListener('mousemove', pointerMove);
                window.removeEventListener('touchmove', pointerMove);
                window.removeEventListener('mouseup', pointerUp);
                window.removeEventListener('touchend', pointerUp);
                tool.removeEventListener('mousedown', pointerDown);
                tool.removeEventListener('touchstart', pointerDown);
            } catch(_) {}
        };
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                showCurrentStep();
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentStepIndex < totalSteps - 1) {
                currentStepIndex++;
                showCurrentStep();
            }
        });
    }

    showCurrentStep();
});