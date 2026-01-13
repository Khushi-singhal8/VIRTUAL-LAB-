document.addEventListener("DOMContentLoaded", function() {
    console.log('Simulation E6 script loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const hotspotSteps = new Set(['step1','step2','step4','step6']);
    const hotspotCompleted = { step1:false, step2:false, step6:false };

    const steps = [
        { id: 'step1', title: 'Clean workpiece using wire brush', src: 'img/simulation/1.mp4', type: 'video' },
        { id: 'step2', title: 'Turn on shielding gas', src: 'img/simulation/2.mp4', type: 'video' },
        { id: 'step3', title: 'Adjust voltage', src: 'img/simulation/3.mp4', type: 'video' },
        { id: 'step4', title: 'Extrude the electrode wire', src: 'img/simulation/4.mp4', type: 'video' },
        { id: 'step5', title: 'Welding process; move torch steadily across joint', src: 'img/simulation/5.mp4', type: 'video' },
        { id: 'step6', title: 'Clean the weld to remove slag', src: 'img/simulation/6.mp4', type: 'video' }
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

    function isHotspotStep(step) { return hotspotSteps.has(step.id); }
    function isHotspotDone(step) { return !isHotspotStep(step) || hotspotCompleted[step.id]; }

    function setHotspotDone(stepId) { if (hotspotCompleted.hasOwnProperty(stepId)) hotspotCompleted[stepId] = true; }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (isHotspotStep(step)) {
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
            step1: { x: 0.6506482281763181, y: 0.29908199176338446, w: 0.28988764044943816, h: 0.2500001497566455, instruction:'Click brush to proceed.' },
            step2: { x: 0.4871564390665514, y: 0.20115911643579185, w: 0.15579948141745895, h: 0.1441557469112692, instruction:'Open shielding gas – click to continue.' },
            step4: { x: 0.8229934406678593, y: 0.44188458367683425, w: 0.12908517590936197, h: 0.14415564715581206, instruction:'Press button to release electrode.' },
            step6: { x: 0.5135868625756267, y: 0.4199985024335455, w: 0.18, h: 0.20898539872706853, instruction:'Clean weld – click to continue.' }
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
            setHotspotDone(step.id);
            instructionElem.textContent = '  ';
            video.play().catch(()=>{});
            if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
        }, { once: true });

        video.addEventListener('ended', () => {
            instructionElem.textContent = 'Step complete.';
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