document.addEventListener("DOMContentLoaded", function () {
    console.log('Simulation E9 script loaded');

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const resetButton = document.getElementById('reset-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;
    let selectedMaterial = null; // 'aluminium', 'brass' or 'steel'
    let selectedThickness = null; // '1mm' or '5mm'

    const steps = [
        {
            id: 'step0',
            mode: 'selection',
            title: 'Select Material and Thickness',
            isSelectionStep: true
        },
        {
            id: 'step0_5',
            mode: 'schematic',
            title: 'Schematic Diagram',
            instruction: 'Review the schematic diagram for the selected thickness.'
        },
        {
            id: 'step1',
            mode: 'autoplay',
            title: 'Marking Step',
            src: 'images/simulation/0.5.mp4'
        },
        {
            id: 'step2', mode: 'drag', title: 'Place workpiece on apparatus (drag & drop).',
            background: 'images/simulation/1.png', tool: 'images/simulation/1-tool.png',
            target: { mode: 'rel', x: 0.48, y: 0.7 },
            init: { mode: 'rel', x: 0.82, y: 0.30 },
            anchor: { x: 0.5, y: 0.5 },
            toolSize: { widthRel: 0.2 },
            tolerance: 55,
            instruction: 'Drag the workpiece onto the marked location on the apparatus.'
        },
        {
            id: 'step3', mode: 'drag', title: 'Setup handle on apparatus (drag & drop).',
            background: 'images/simulation/2.png', tool: 'images/simulation/2-tool.png',
            target: { mode: 'rel', x: 0.46, y: 0.45 },
            init: { mode: 'rel', x: 0.80, y: 0.25 },
            anchor: { x: 0.25, y: 0.2 },
            toolSize: { widthRel: 0.30 },
            tolerance: 55,
            instruction: 'Drag the handle so its hinge (top-left) snaps into place.'
        },
        { id: 'step4', mode: 'hotspot', title: 'Start operation and measure angle', src: 'images/simulation/3.mp4' },
        {
            id: 'step4_5', mode: 'drag', title: 'Measure Angle with Protractor',
            background: 'images/simulation/3.5.png', tool: 'protractor.png',
            target: { mode: 'rel', x: 0.5, y: 0.55 }, // Estimated target
            init: { mode: 'rel', x: 0.82, y: 0.30 },
            anchor: { x: 0.477, y: 0.85 },
            toolSize: { widthRel: 0.6 },
            snapRotation: 323,
            tolerance: 120,
            instruction: 'Drag the protractor to measure the angle.'
        },
        { id: 'step5', mode: 'hotspot', title: 'Remove punch and measure angle', src: 'images/simulation/4.mp4' },
        {
            id: 'step5_5', mode: 'drag', title: 'Measure Final Angle with Protractor',
            background: 'images/simulation/4.5.png', tool: 'protractor.png',
            target: { mode: 'rel', x: 0.515, y: 0.68 },
            init: { mode: 'rel', x: 0.82, y: 0.30 },
            anchor: { x: 0.477, y: 0.85 },
            toolSize: { widthRel: 0.6 },
            snapRotation: 324,
            tolerance: 120,
            instruction: 'Drag the protractor to measure the final angle after spring back.'
        },
        { id: 'step7', mode: 'print', title: 'Observation & Result (Print)' }
    ];

    const angleTextByStep = {
        step4: 'Angle: 106°',
        step5: 'Angle: 112°'
    };

    const hotspotSteps = new Set(['step4', 'step5']);
    const stepCompleted = Object.fromEntries(steps.map(s => [s.id, s.mode !== 'drag' && s.mode !== 'autoplay' && !hotspotSteps.has(s.id)]));

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

    function isHotspotStep(step) { return step.mode === 'hotspot' && hotspotSteps.has(step.id); }
    function isHotspotDone(step) { return stepCompleted[step.id]; }
    function setStepDone(stepId) { if (stepCompleted.hasOwnProperty(stepId)) stepCompleted[stepId] = true; }

    // Get simulation path based on material and thickness selection
    function getSimulationPath(src) {
        if (!selectedMaterial || !selectedThickness || !src) return src;
        if (src === 'protractor.png') return 'images/simulation/' + src;
        // Map selection to folder name
        const folderName = `${selectedMaterial}-${selectedThickness}`;
        return src.replace('images/simulation/', `images/simulation/${folderName}/`);
    }

    function showCurrentStep() {
        if (!gifContainer) return;
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (step.isSelectionStep) {
            renderSelectionStep();
        } else if (step.mode === 'schematic') {
            renderSchematicStep(step, timestamp);
        } else if (step.mode === 'drag') {
            renderDragStep(step, timestamp);

        } else if (isHotspotStep(step)) {
            renderHotspotFirstFrame(step, timestamp);
        } else if (step.mode === 'print') {
            renderResultStep();
        } else {
            renderAutoplayStep(step, timestamp);
        }

        if (currentStepElement) currentStepElement.textContent = currentStepIndex + 1;
        if (prevButton) prevButton.disabled = currentStepIndex === 0;

        // Update next button logic
        if (nextButton) {
            if (step.isSelectionStep) {
                // Enabled only when selection is complete (handled in renderSelectionStep and updateSelectionSummary)
                nextButton.disabled = !selectedMaterial || !selectedThickness;
            } else if (step.mode === 'schematic') {
                // Schematic is just viewing an image, always enabled
                nextButton.disabled = false;
            } else if (step.mode === 'print') {
                nextButton.disabled = true; // Last step
            } else {
                // For drag, hotspot, autoplay: disabled until explicitly completed
                nextButton.disabled = !isHotspotDone(step);
            }
            // Final check for last step
            if (currentStepIndex === totalSteps - 1) nextButton.disabled = true;
        }

        if (stepsList) {
            const items = stepsList.querySelectorAll('.step-item');
            items.forEach((itm, idx) => {
                if (idx === currentStepIndex) itm.classList.add('active'); else itm.classList.remove('active');
            });
        }
    }

    function renderSelectionStep() {
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>Select Material and Thickness</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                
                <div class="selection-container">
                    <div class="selection-section">
                        <h4>Choose Material:</h4>
                        <div class="material-options">
                            <div class="material-card" data-material="aluminium" id="material-aluminium">
                                <div class="material-icon">
                                    <img src="images/simulation/aluminium-5mm/1-tool.png" alt="Aluminium workpiece" style="max-width: 150px; height: auto;">
                                </div>
                                <h5>Aluminium</h5>
                                <p>Lightweight metal</p>
                            </div>
                            <div class="material-card" data-material="brass" id="material-brass">
                                <div class="material-icon">
                                    <img src="images/simulation/brass-5mm/1-tool.png" alt="Brass workpiece" style="max-width: 150px; height: auto;">
                                </div>
                                <h5>Brass</h5>
                                <p>Copper-zinc alloy</p>
                            </div>
                            <div class="material-card" data-material="steel" id="material-steel">
                                <div class="material-icon">
                                    <img src="images/simulation/steel-5mm/1-tool.png" alt="Steel workpiece" style="max-width: 150px; height: auto;">
                                </div>
                                <h5>Mild Steel</h5>
                                <p>Corrosion-resistant alloy</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="selection-section">
                        <h4>Choose Thickness:</h4>
                        <div class="thickness-options">
                            <button class="thickness-btn" data-thickness="1mm" id="thickness-1mm">1mm</button>
                            <button class="thickness-btn" data-thickness="5mm" id="thickness-5mm">5mm</button>
                        </div>
                    </div>
                    
                    <div class="selection-summary" id="selection-summary">
                        Please select both material and thickness to proceed.
                    </div>
                </div>
            </div>
        `;

        // Material selection handlers
        const materialCards = gifContainer.querySelectorAll('.material-card');
        materialCards.forEach(card => {
            if (selectedMaterial && card.dataset.material === selectedMaterial) {
                card.classList.add('selected');
            }
            card.addEventListener('click', () => {
                selectedMaterial = card.dataset.material;
                materialCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                updateSelectionSummary();
            });
        });

        // Thickness selection handlers
        const thicknessButtons = gifContainer.querySelectorAll('.thickness-btn');
        thicknessButtons.forEach(btn => {
            if (selectedThickness && btn.dataset.thickness === selectedThickness) {
                btn.classList.add('selected');
            }
            btn.addEventListener('click', () => {
                selectedThickness = btn.dataset.thickness;
                thicknessButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateSelectionSummary();
            });
        });

        updateSelectionSummary();

        function updateSelectionSummary() {
            const summary = document.getElementById('selection-summary');
            if (!summary) return;

            if (selectedMaterial && selectedThickness) {
                let materialName = 'Aluminium';
                if (selectedMaterial === 'brass') materialName = 'Brass';
                if (selectedMaterial === 'steel') materialName = 'Stainless Steel';
                summary.textContent = `Selected: ${materialName}, ${selectedThickness}`;
                summary.classList.add('complete');
                if (nextButton) nextButton.disabled = false;
            } else {
                const parts = [];
                if (!selectedMaterial) parts.push('material');
                if (!selectedThickness) parts.push('thickness');
                summary.textContent = `Please select ${parts.join(' and ')} to proceed.`;
                summary.classList.remove('complete');
                // if (nextButton) nextButton.disabled = true;
            }
        }
    }

    function renderSchematicStep(step, timestamp) {
        // Determine which schematic image to show based on thickness
        const schematicImage = selectedThickness === '5mm' ? '5mm.png' : '1mm.png';
        // Use getSimulationPath to load from material-specific folders
        const imagePath = getSimulationPath(`images/simulation/${schematicImage}`) + `?t=${timestamp}`;

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="schematic-stage" style="display: flex; align-items: center; justify-content: center;">
                    <img src="${imagePath}" alt="Schematic Diagram" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
                <div class="drag-instructions">${step.instruction}</div>
            </div>
        `;

        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
    }

    // Generate dynamic instruction based on selection
    function getDynamicInstruction(stepId) {

        if (stepId === 'step4_5') {
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm')
                return `Measurement on protractor: 106°\nBend Angle before release: 180° - 106° = 74°`;
        } else if (stepId === 'step5') {
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm')
                return `Measurement on protractor: 114°\nFinal bend angle after release : 180° - 114 = 66°\n
Spring Back angle = 74° - 66° = 8°`;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm')
                return `Measurement on protractor: 110°\nFinal bend angle after release : 180° - 110 = 70°\n
Spring Back angle = 74° - 70° = 4°`;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm')
                return `Measurement on protractor: 112°\nFinal bend angle after release : 180° - 112 = 68°\n
Spring Back angle = 74° - 68° = 6°`;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm')
                return `Measurement on protractor: 110°\nFinal bend angle after release : 180° - 110 = 70°\n
Spring Back angle = 74° - 70° = 4°`;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm')
                return `Measurement on protractor: 126°\nFinal bend angle after release : 180° - 126 = 54°\n
Spring Back angle = 74° - 54° = 20°`;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm')
                return `Measurement on protractor: 116°\nFinal bend angle after release : 180° - 116 = 64°\n
Spring Back angle = 74° - 64° = 10°`;
        } else if (stepId === 'step5_5') {
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm')
                return `Measurement on protractor: 114°\nFinal bend angle after release : 180° - 114 = 66°\n
Spring Back angle = 74° - 66° = 8°`;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm')
                return `Measurement on protractor: 110°\nFinal bend angle after release : 180° - 110 = 70°\n
Spring Back angle = 74° - 70° = 4°`;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm')
                return `Measurement on protractor: 112°\nFinal bend angle after release : 180° - 112 = 68°\n
Spring Back angle = 74° - 68° = 6°`;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm')
                return `Measurement on protractor: 110°\nFinal bend angle after release : 180° - 110 = 70°\n
Spring Back angle = 74° - 70° = 4°`;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm')
                return `Measurement on protractor: 126°\nFinal bend angle after release : 180° - 126 = 54°\n
Spring Back angle = 74° - 54° = 20°`;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm')
                return `Measurement on protractor: 116°\nFinal bend angle after release : 180° - 116 = 64°\n
Spring Back angle = 74° - 64° = 10°`;
        }
        return 'Click to continue.';
    }

    // Get snap rotation angle based on selection and step
    function getSnapRotation(stepId) {
        if (stepId === 'step4_5') {
            // All materials use 323 degrees for step 3.5 (can be customized per material)
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm') return 323;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm') return 323;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm') return 323;
        } else if (stepId === 'step5_5') {
            // All materials use 324 degrees for step 4.5 (can be customized per material)
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm') return 326;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm') return 326;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm') return 327;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm') return 324;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm') return 333;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm') return 328;
        }
        return 0; // Default: no rotation
    }

    function renderHotspotFirstFrame(step, timestamp) {
        // Generate initial instruction shown before hotspot is clicked
        function getInitialInstruction(stepId) {
            if (stepId === 'step1') {
                return 'Click to start the marking step.';
            } else if (stepId === 'step4') {
                return 'Click on the handle to start the bending operation.';
            } else if (stepId === 'step5') {
                return 'Click on the handle to remove the punch and measure the final angle.';
            }
            return 'Click to continue.';
        }


        const hotspotMap = {
            step1: { x: 0.5, y: 0.5, w: 0.15, h: 0.15 },
            step4: { x: 0.5347906403940886, y: 0.5697624521072796, w: 0.07376974935177183, h: 0.12618494945713216 },
            step5: { x: 0.5410837438423646, y: 0.5721948549534757, w: 0.07376974935177183, h: 0.12618494945713216 }
        };
        const cfg = hotspotMap[step.id] || { x: 0.45, y: 0.45, w: 0.15, h: 0.15 };
        const initialInstruction = getInitialInstruction(step.id);
        const dynamicInstruction = getDynamicInstruction(step.id);
        const videoSrc = getSimulationPath(step.src); // Apply branching

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${videoSrc}?t=${timestamp}" style="width:100%;height:100%;" preload="auto" playsinline muted></video>
                    <button id="play-hotspot" class="play-hotspot" style="display:none;"></button>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
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
            instructionElem.textContent = initialInstruction;
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
            // Do not marks as done here - wait for video end
            instructionElem.textContent = '  ';
            video.play().catch(() => { });
            if (nextButton) nextButton.disabled = true;
        }, { once: true });

        video.addEventListener('ended', () => {
            // Show "Step complete!"
            instructionElem.textContent = 'Step complete!';
            if (nextButton) nextButton.disabled = false;
            setStepDone(step.id);
        }, { once: true });

        window.addEventListener('resize', layoutHotspot);

        cleanupCurrent = function () {
            try { window.removeEventListener('resize', layoutHotspot); } catch (_) { }
        };
    }

    function renderAutoplayStep(step, timestamp) {
        const videoSrc = getSimulationPath(step.src); // Apply branching
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="play-stage" id="play-stage">
                    <video id="step-video" src="${videoSrc}?t=${timestamp}" style="width:100%;height:100%;" playsinline muted></video>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
            </div>`;

        const video = document.getElementById('step-video');
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => { });
        }, { once: true });

        video.addEventListener('ended', () => {
            if (document.getElementById('play-instruction')) {
                document.getElementById('play-instruction').textContent = 'Step complete!';
            }
            if (nextButton) nextButton.disabled = false;
            setStepDone(step.id);
        }, { once: true });

        cleanupCurrent = function () {
            try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) { }
        };
    }

    function renderDragStep(step, timestamp) {
        stepCompleted[step.id] = false;
        if (nextButton) nextButton.disabled = true;

        const backgroundPng = getSimulationPath(step.background); // Apply branching
        const toolPng = getSimulationPath(step.tool); // Apply branching
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
                <div class="drag-instructions" id="drag-instruction" style="white-space: pre-line;">${step.instruction || 'Drag the tool to the highlighted target.'}</div>
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
            dropZone.style.left = (target.x - dzSize / 2) + 'px';
            dropZone.style.top = (target.y - dzSize / 2) + 'px';
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

        // Hide tool initially until properly positioned
        tool.style.visibility = 'hidden';

        if (stageBg.complete && stageBg.naturalWidth) {
            resizeStageToImage();
            tool.style.visibility = 'visible';
        } else {
            stageBg.addEventListener('load', () => {
                resizeStageToImage();
                tool.style.visibility = 'visible';
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

        function centerDistance(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy); }
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
            tool.style.transition = 'left 0.18s ease, top 0.18s ease, transform 0.3s ease';
            tool.style.left = left + 'px';
            tool.style.top = top + 'px';

            const rotation = getSnapRotation(step.id);

            // Function to run after successful placement/rotation
            const onComplete = () => {
                dropZone.classList.add('success');
                stepCompleted[step.id] = true;
                setStepDone(step.id);

                if (step.id !== 'step4_5' && step.id !== 'step5_5') {
                    const ok = document.createElement('div');
                    ok.className = 'drag-success';
                    ok.textContent = 'Placed correctly!';
                    stage.appendChild(ok);
                    setTimeout(() => ok.remove(), 1200);
                }

                const dynInst = getDynamicInstruction(step.id);
                if (step.id !== 'step4_5' && step.id !== 'step5_5') {
                    document.getElementById('drag-instruction').textContent = 'Step complete!';
                } else if (dynInst && dynInst !== 'Click to continue.') {
                    document.getElementById('drag-instruction').textContent = dynInst;
                }

                if (nextButton) nextButton.disabled = false;
            };

            if (rotation) {
                // Determine anchor percent for transform origin
                const anchorPercentX = (anchor.x * 100).toFixed(1);
                const anchorPercentY = (anchor.y * 100).toFixed(1);

                // Set instruction to prompt for click
                document.getElementById('drag-instruction').textContent = "Click on the protractor to align it.";

                // Add one-time click listener for rotation
                tool.style.cursor = 'pointer';
                const rotateOnClick = () => {
                    tool.style.cursor = 'default';
                    // Set transform-origin to the anchor point (base of protractor)
                    tool.style.transformOrigin = `${anchorPercentX}% ${anchorPercentY}%`;
                    tool.style.transform = `rotate(${rotation - 360}deg)`;

                    // Wait for rotation animation then complete
                    setTimeout(onComplete, 350);
                };
                // Add listener after a short delay to avoid triggering on the current drag-release click
                setTimeout(() => {
                    tool.addEventListener('click', rotateOnClick, { once: true });
                    // Also support touch
                    tool.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        rotateOnClick();
                    }, { once: true });
                }, 100);

            } else {
                // No rotation needed, complete immediately
                onComplete();
            }
        }

        tool.addEventListener('mousedown', pointerDown);
        tool.addEventListener('touchstart', pointerDown, { passive: false });
        window.addEventListener('mousemove', pointerMove, { passive: true });
        window.addEventListener('touchmove', pointerMove, { passive: false });
        window.addEventListener('mouseup', pointerUp, { passive: true });
        window.addEventListener('touchend', pointerUp, { passive: true });

        cleanupCurrent = function () {
            try {
                window.removeEventListener('resize', resizeStageToImage);
                window.removeEventListener('mousemove', pointerMove);
                window.removeEventListener('touchmove', pointerMove);
                window.removeEventListener('mouseup', pointerUp);
                window.removeEventListener('touchend', pointerUp);
                tool.removeEventListener('mousedown', pointerDown);
                tool.removeEventListener('touchstart', pointerDown);
            } catch (_) { }
        };
    }

    function renderResultStep() {
        if (!selectedMaterial || !selectedThickness) return;

        // Calculate values based on selection
        let step3Angle, step4Angle, springBack;
        let matName = 'Aluminium';
        if (selectedMaterial === 'brass') matName = 'Brass';
        if (selectedMaterial === 'steel') matName = 'Mild Steel';

        // Logic from getDynamicInstruction
        if (selectedMaterial == 'aluminium') {
            if (selectedThickness == '1mm') {
                step3Angle = 106;
                step4Angle = 114;
                // Bend Angle = 74
                // Final Angle = 66
                // Spring Back = 8
            } else { // 5mm
                step3Angle = 106;
                step4Angle = 110;
                // Bend Angle = 74
                // Final Angle = 70
                // Spring Back = 4
            }
        } else if (selectedMaterial == 'brass') {
            if (selectedThickness == '1mm') {
                step3Angle = 106; // Protractor reading
                step4Angle = 112; // Protractor reading
                // Bend Angle = 180 - 106 = 74
                // Final Angle = 180 - 112 = 68
                // Spring Back = 74 - 68 = 6
            } else { // 5mm
                step3Angle = 106;
                step4Angle = 110;
                // Bend Angle = 74
                // Final Angle = 70
                // Spring Back = 4
            }
        } else { // Steel
            if (selectedThickness == '1mm') {
                step3Angle = 106;
                step4Angle = 126;
                // Bend Angle = 74
                // Final Angle = 54
                // Spring Back = 20
            } else { // 5mm
                step3Angle = 106;
                step4Angle = 116;
                // Bend Angle = 74
                // Final Angle = 64
                // Spring Back = 10
            }
        }

        const bendAngle = 180 - step3Angle;
        const finalAngle = 180 - step4Angle;
        springBack = bendAngle - finalAngle;


        gifContainer.innerHTML = `
            <div class="gif-wrapper print-area">
                <h2 style="text-align:center;">EXPERIMENT OBSERVATION SHEET</h2>
                <hr>
                
                <p><strong>Experiment:</strong> Spring Back Effect Analysis</p>
                <p><strong>Material Used:</strong> ${matName}</p>
                <p><strong>Thickness:</strong> ${selectedThickness}</p>
                
                <!-- MATERIAL IMAGE (Optional) -->
                <div style="text-align:center; margin: 15px 0;">
                    <img src="images/simulation/${selectedMaterial}-${selectedThickness}/1-tool.png" alt="${matName} ${selectedThickness}" style="max-width:400px">
                </div>
                
                <h3>Measurements & Calculations</h3>
                <table border="1" width="100%" cellpadding="8">
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td><strong>Loaded State</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Protractor Reading</td>
                        <td>${step3Angle}°</td>
                    </tr>
                    <tr>
                        <td>Bend Angle (180° - Reading)</td>
                        <td>${bendAngle}°</td>
                    </tr>
                    
                    <tr>
                        <td><strong>Unloaded State</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Protractor Reading</td>
                        <td>${step4Angle}°</td>
                    </tr>
                     <tr>
                        <td>Final Bend Angle (180° - Reading)</td>
                        <td>${finalAngle}°</td>
                    </tr>
                    
                    <tr>
                        <td><strong>Result</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>Spring Back Angle</strong></td>
                        <td><strong>${springBack}°</strong></td>
                    </tr>
                </table>
                
                <h3 style="margin-top:20px;">Conclusion</h3>
                <p>
                    The spring back effect was observed for ${matName} with ${selectedThickness} thickness.
                    The difference between the loaded bend angle and the final unloaded angle indicates the elastic recovery of the material.
                </p>
                
                <div class="no-print" style="text-align:center; margin-top:30px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">🖨 Print Observation Sheet</button>
                </div>
            </div>
        `;

        if (nextButton) nextButton.disabled = true;
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
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            location.reload();
        });
    }

    showCurrentStep();
});
