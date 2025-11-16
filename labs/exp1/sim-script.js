document.addEventListener("DOMContentLoaded", function() {
    console.log('Simulation E10 script (multi-substeps) loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;

    const steps = [
        {
            id: 'step1',
            title: 'Measure internal diameter of workpiece',
            src: 'images/simulation/1.mp4',
            type: 'video',
            substeps: [
                { time: 1.45, hotspot:{x: 0.346542783059637, y: 0.3661370273305878, w: 0.05604148660328436, h: 0.09014601272931487}, instruction:'Unscrew the lock screw' },
                { time: 4.4, hotspot:{x: 0.3391097666378565, y: 0.5368086858854362, w: 0.16222990492653414, h: 0.16}, instruction:'Move jaws using finger hook.' },
                { time: 7.4, hotspot:{x: 0.1990924805531547, y: 0.0006798951703481843, w: 0.20717372515125324, h: 0.42057656308498687}, instruction:'Move workpiece to correct position.' },
                { time: 9.5, hotspot:{x: 0.4445548833189283, y: 0.5368086858854362, w: 0.16222990492653414, h: 0.16}, instruction:'Move jaws using finger hook.' },
                { time: 11.5, hotspot:{x: 0.4860414866032844, y: 0.37806664170722576, w: 0.0567847882454624, h: 0.09410707600149758}, instruction:'Tighten the lock screw.' },
                { time: 24, instruction:'Take reading' }
            ]
        },
        {
            id: 'step2',
            title: 'Measure outer diameter of workpiece',
            src: 'images/simulation/2.mp4',
            type: 'video',
            substeps: [
                { time: 1.65, hotspot:{x: 0.4674157303370786, y: 0.16657431673530512, w: 0.06258426966292134, h: 0.1021265443654062}, instruction:'Unscrew the lock screw.' },
                { time: 3.65, hotspot:{x: 0.4229386343993085, y: 0.4209659303631599, w: 0.15630077787381158, h: 0.1740097341819543}, instruction:'Move jaws using finger hook.' },
                { time: 5.6, hotspot:{x: 0.14347450302506481, y: 0.6306252339947586, w: 0.22717372515125323, h: 0.3387420441782104}, instruction:'Move workpiece to correct position.' },
                { time: 7.65, hotspot:{x: 0.7254451166810718, y: 0.5767128416323475, w: 0.1597579948141746, h: 0.18}, instruction:'Move jaws using finger hook.' },
                { time: 9.75, hotspot:{x: 0.6226015557476232, y: 0.2313051291651067, w: 0.0567847882454624, h: 0.09410707600149758}, instruction:'Tighten the lock screw.' },
                { time: 25, instruction:'Take reading' }
            ]
        },
        {
            id: 'step3',
            title: 'Measure thickness',
            src: 'images/simulation/3.mp4',
            type: 'video',
            substeps: [
                { time: 1.825, hotspot:{x: 0.6723768366464996, y: 0.7156510670160988, w: 0.06369922212618842, h: 0.12202920254586297}, instruction:'Unscrew the lock screw.' },
                { time: 4.85, hotspot:{x: 0.47035436473638725, y: 0.6345877948333957, w: 0.1, h: 0.10405840509172594}, instruction:'Move jaws using finger hook.' },
                { time: 7.85, hotspot:{x: 0.4893690579083838, y: 0.20628378884312992, w: 0.25903197925669835, h: 0.42154249344814676}, instruction:'Move workpiece to correct position.' },
                { time: 10.84, hotspot:{x: 0.3476231633535004, y: 0.6705293897416698, w: 0.11901469317199653, h: 0.11004867090977162}, instruction:'Move jaws using finger hook.' },
                { time: 12.9, hotspot:{x: 0.6691443388072602, y: 0.7364223137401722, w: 0.061970613656006916, h: 0.11004867090977162}, instruction:'Tighten the lock screw.' },
                { time: 25, instruction:'Take reading' }
            ]
        },
        {
            id: 'step4',
            title: 'Measure depth',
            src: 'images/simulation/4.mp4',
            type: 'video',
            substeps: [
                { time: 1.03, hotspot:{x: 0.8568366464995678, y: 0.18019318607263196, w: 0.13901469317199655, h: 0.3447323099962561}, instruction:'Move workpiece to correct position.'},
                { time: 3, hotspot:{x: 0.11408815903197926, y: 0.3958427555222763, w: 0.06468452895419188, h: 0.1021265443654062}, instruction:'Unscrew the lock screw.' },
                { time: 4.98, hotspot:{x: 0.21607605877268798, y: 0.623472856608012, w: 0.13555747623163353, h: 0.12608760763758892}, instruction:'Move jaws using finger hook.' },
                { time: 7.02, hotspot:{x: 0.20933448573898011, y: 0.35005016847622616, w: 0.06542783059636992, h: 0.11004867090977162}, instruction:'Tighten the lock screw.' },
                { time: 25, instruction:'Take reading' }
            ]
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

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (Array.isArray(step.substeps) && step.substeps.length) {
            renderSubstepVideo(step, timestamp);
        } else {
            renderSimpleVideo(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;
        if (nextButton) nextButton.disabled = true;

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderSubstepVideo(step, timestamp) {
        const substeps = step.substeps;
        let currentSubstep = 0;
        if (nextButton) nextButton.disabled = true;
        const hotspotDebug = true;
        let finalHandled = false;

        gifContainer.innerHTML = `
            <div class="gif-wrapper" style="width:100%;height:100%;">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="substep-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                    <button id="substep-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="substep-instruction" class="drag-instructions"></div>
            </div>`;

        const video = document.getElementById('substep-video');
        const hotspot = document.getElementById('substep-hotspot');
        const instructionElem = document.getElementById('substep-instruction');
        const stage = document.getElementById('play-stage');
        if (hotspotDebug) hotspot.classList.add('debug-highlight');

        function layoutHotspot(rel) {
            if (!rel) return;
            const rect = video.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            const offsetX = rect.left - stageRect.left;
            const offsetY = rect.top - stageRect.top;
            hotspot.style.left = (offsetX + rect.width * rel.x) + 'px';
            hotspot.style.top = (offsetY + rect.height * rel.y) + 'px';
            hotspot.style.width = (rect.width * rel.w) + 'px';
            hotspot.style.height = (rect.height * rel.h) + 'px';
        }

        function setupSubstep() {
            if (currentSubstep >= substeps.length) return;
            const s = substeps[currentSubstep];
            instructionElem.textContent = s.instruction || '';
            if (s.hotspot) {
                layoutHotspot(s.hotspot);
                hotspot.style.display = 'block';
                hotspot.onclick = () => {
                    hotspot.style.display = 'none';
                    video.play();
                };
            } else {
                    const isLast = currentSubstep === substeps.length - 1;
                    if (isLast) {
                        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                    try { video.play(); } catch(_) {}
                    } else {
                        try { video.play(); } catch(_) {}
                    }
            }
        }

        let rafId = null; let intervalId = null; const EPS = 0.01;
        function checkAndPause() {
            if (currentSubstep >= substeps.length) return;
            const target = substeps[currentSubstep].time;
            const t = video.currentTime;
            if (t + EPS >= target) {
                const s = substeps[currentSubstep];
                const isLast = currentSubstep === substeps.length - 1;
                if (isLast && !s.hotspot) {
                    if (!finalHandled) {
                        instructionElem.textContent = s.instruction || 'Step complete!';
                        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                        finalHandled = true;
                    }
                    currentSubstep = substeps.length;
                    return;
                }
                video.pause();
                if (currentSubstep < substeps.length - 1) {
                    currentSubstep++;
                    setupSubstep();
                } else {
                    instructionElem.textContent = s.instruction || 'Step complete!';
                    if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
                }
            }
        }

        function frameCallback() {
            checkAndPause();
            if (!video.paused && !video.ended) {
                rafId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(frameCallback) : null;
            }
        }

        video.addEventListener('loadedmetadata', () => {
            video.pause();
            setupSubstep();
        }, { once: true });

        video.addEventListener('loadeddata', () => {
            if (currentSubstep < substeps.length && substeps[currentSubstep].hotspot) {
                layoutHotspot(substeps[currentSubstep].hotspot);
            }
        }, { once: true });

        function onPlay() {
            if (typeof video.requestVideoFrameCallback === 'function') {
                rafId = video.requestVideoFrameCallback(frameCallback);
            } else {
                intervalId = setInterval(checkAndPause, 33);
            }
        }
        function onPause() {
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') { video.cancelVideoFrameCallback(rafId); rafId=null; }
            if (intervalId) { clearInterval(intervalId); intervalId=null; }
        }
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        window.addEventListener('resize', () => { if (substeps[currentSubstep] && substeps[currentSubstep].hotspot) layoutHotspot(substeps[currentSubstep].hotspot); });

        cleanupCurrent = () => {
            try {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
            } catch(_) {}
            if (rafId && typeof video.cancelVideoFrameCallback === 'function') {
                video.cancelVideoFrameCallback(rafId); rafId=null;
            }
            if (intervalId) { clearInterval(intervalId); intervalId=null; }
        };
    }

    function renderSimpleVideo(step, timestamp) {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="simple-video" src="${step.src}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                </div>
                <div id="play-instruction" class="drag-instructions"></div>
            </div>`;
        const video = document.getElementById('simple-video');
        video.addEventListener('loadedmetadata', () => { video.play().catch(()=>{}); }, { once:true });
        video.addEventListener('ended', () => { if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1); }, { once:true });
        cleanupCurrent = () => { try { video.pause(); video.removeAttribute('src'); video.load(); } catch(_){} };
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentStepIndex > 0) { currentStepIndex--; showCurrentStep(); }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentStepIndex < totalSteps - 1) { currentStepIndex++; showCurrentStep(); }
        });
    }

    showCurrentStep();
});