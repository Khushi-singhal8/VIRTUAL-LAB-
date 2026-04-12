'use strict';

document.addEventListener("DOMContentLoaded", function () {

    const assetList = [
        "images/simulation/0.5.mp4",
        "images/simulation/1.png",
        "images/simulation/1-tool.png",
        "images/simulation/2.png",
        "images/simulation/2-tool.png",
        "images/simulation/3.mp4",
        "images/simulation/4.mp4",
        "images/simulation/1mm.png",
        "images/simulation/5mm.png",
        "images/simulation/protractor.png",

        "images/simulation/aluminium-1mm/0.5.mp4",
        "images/simulation/aluminium-1mm/1.png",
        "images/simulation/aluminium-1mm/1-tool.png",
        "images/simulation/aluminium-1mm/2.png",
        "images/simulation/aluminium-1mm/2-tool.png",
        "images/simulation/aluminium-1mm/3.mp4",
        "images/simulation/aluminium-1mm/3.5.png",
        "images/simulation/aluminium-1mm/4.mp4",
        "images/simulation/aluminium-1mm/4.5.png",
        "images/simulation/aluminium-1mm/1mm.png",

        "images/simulation/aluminium-5mm/0.5.mp4",
        "images/simulation/aluminium-5mm/1.png",
        "images/simulation/aluminium-5mm/1-tool.png",
        "images/simulation/aluminium-5mm/2.png",
        "images/simulation/aluminium-5mm/2-tool.png",
        "images/simulation/aluminium-5mm/3.mp4",
        "images/simulation/aluminium-5mm/3.5.png",
        "images/simulation/aluminium-5mm/4.mp4",
        "images/simulation/aluminium-5mm/4.5.png",
        "images/simulation/aluminium-5mm/5mm.png",

        "images/simulation/brass-1mm/0.5.mp4",
        "images/simulation/brass-1mm/1.png",
        "images/simulation/brass-1mm/1-tool.png",
        "images/simulation/brass-1mm/2.png",
        "images/simulation/brass-1mm/2-tool.png",
        "images/simulation/brass-1mm/3.mp4",
        "images/simulation/brass-1mm/3.5.png",
        "images/simulation/brass-1mm/4.mp4",
        "images/simulation/brass-1mm/4.5.png",
        "images/simulation/brass-1mm/1mm.png",

        "images/simulation/brass-5mm/0.5.mp4",
        "images/simulation/brass-5mm/1.png",
        "images/simulation/brass-5mm/1-tool.png",
        "images/simulation/brass-5mm/2.png",
        "images/simulation/brass-5mm/2-tool.png",
        "images/simulation/brass-5mm/3.mp4",
        "images/simulation/brass-5mm/3.5.png",
        "images/simulation/brass-5mm/4.mp4",
        "images/simulation/brass-5mm/4.5.png",
        "images/simulation/brass-5mm/5mm.png",

        "images/simulation/steel-1mm/0.5.mp4",
        "images/simulation/steel-1mm/1.png",
        "images/simulation/steel-1mm/1-tool.png",
        "images/simulation/steel-1mm/2.png",
        "images/simulation/steel-1mm/2-tool.png",
        "images/simulation/steel-1mm/3.mp4",
        "images/simulation/steel-1mm/3.5.png",
        "images/simulation/steel-1mm/4.mp4",
        "images/simulation/steel-1mm/4.5.png",
        "images/simulation/steel-1mm/1mm.png",

        "images/simulation/steel-5mm/0.5.mp4",
        "images/simulation/steel-5mm/1.png",
        "images/simulation/steel-5mm/1-tool.png",
        "images/simulation/steel-5mm/2.png",
        "images/simulation/steel-5mm/2-tool.png",
        "images/simulation/steel-5mm/3.mp4",
        "images/simulation/steel-5mm/3.5.png",
        "images/simulation/steel-5mm/4.mp4",
        "images/simulation/steel-5mm/4.5.png",
        "images/simulation/steel-5mm/5mm.png"
    ];

    const assetCache = {};

    function getAssetSrc(originalUrl) {
        return assetCache[originalUrl] || originalUrl;
    }

    function formatSrc(url, timestamp) {
        if (url.startsWith('blob:')) return url;
        return `${url}?t=${timestamp}`;
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

    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const resetButton = document.getElementById('reset-btn');
    const gifContainer = document.getElementById('gif-container');
    const currentStepElement = document.getElementById('current-step');
    const totalStepsElement = document.getElementById('total-steps');
    const stepsList = document.getElementById('steps-list');

    let cleanupCurrent = null;
    let selectedMaterial = null;
    let selectedThickness = null;

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
            arrow: { top: '-374%', left: '637%' },
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
            arrow: { top: '-150%', left: '690%' },
            instruction: 'Drag the handle so its hinge (top-left) snaps into place.'
        },
        { id: 'step4', mode: 'hotspot', title: 'Start operation and measure angle', src: 'images/simulation/3.mp4' },
        {
            id: 'step4_5', mode: 'drag', title: 'Measure Angle with Protractor',
            background: 'images/simulation/3.5.png', tool: 'protractor.png',
            target: { mode: 'rel', x: 0.5, y: 0.55 },
            init: { mode: 'rel', x: 0.52, y: 0.50 },
            anchor: { x: 0.477, y: 0.85 },
            toolSize: { widthRel: 0.6 },
            snapRotation: 323,
            tolerance: 120,
            arrow: { top: '-114%', left: '410%' },
            instruction: 'Drag the protractor to measure the angle.'
        },
        { id: 'step5', mode: 'hotspot', title: 'Remove punch and measure angle', src: 'images/simulation/4.mp4' },
        {
            id: 'step5_5', mode: 'drag', title: 'Measure Final Angle with Protractor',
            background: 'images/simulation/4.5.png', tool: 'protractor.png',
            target: { mode: 'rel', x: 0.515, y: 0.68 },
            init: { mode: 'rel', x: 0.52, y: 0.50 },
            anchor: { x: 0.477, y: 0.85 },
            toolSize: { widthRel: 0.6 },
            snapRotation: 324,
            tolerance: 120,
            arrow: { top: '-234%', left: '388%' },
            instruction: 'Drag the protractor to measure the final angle after spring back.'
        },
        { id: 'step7', mode: 'print', title: 'Observation & Result (Print)' }
    ];

    const stepGuidance = {
        step0_5: {
            now: "Review the schematic diagram.",
            next: "Start marking process."
        },
        step1: {
            now: "Follow the marking process.",
            next: "Place workpiece on apparatus."
        },
        step2: {
            now: "Drag the workpiece onto the marked location on the apparatus.",
            next: "Attach handle to the tool."
        },
        step3: {
            now: "Drag the handle so its hinge (top-left) snaps into place.",
            next: "Start operation and measure angle."
        },
        step4: {
            now: "Click on the handle to start the bending operation.",
            next: "Measure angle."
        },
        step4_5: {
            now: "Drag the protractor to measure the angle.",
            next: "Remove punch."
        },
        step5: {
            now: "Click on the handle to remove the punch.",
            next: "Measure final angle."
        },
        step5_5: {
            now: "Drag the protractor to measure the final angle after spring back.",
            next: "View results."
        }
    };

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
        window.removeEventListener('resize', updateScaling);
    }

    function updateScaling() {
        const container = document.querySelector('.sim-media-container');
        const wrapper = document.querySelector('.scaling-wrapper');
        const stage = document.getElementById('play-stage') || document.getElementById('schematic-stage') || document.getElementById('drag-stage');

        if (!container || !wrapper || !stage) return;

        wrapper.style.transform = 'scale(1)';
        wrapper.style.width = '100%';
        wrapper.style.marginLeft = '0';

        const containerHeight = container.offsetHeight;
        const stageHeight = stage.offsetHeight;

        if (stageHeight > 0) {
            const scale = containerHeight / stageHeight;
            if (scale < 1) {
                wrapper.style.transform = `scale(${scale})`;
                wrapper.style.width = `${(1 / scale) * 100}%`;
                wrapper.style.transformOrigin = 'center center';
                wrapper.style.marginLeft = '0';
            } else {
                wrapper.style.transformOrigin = 'center center';
            }
        }
    }

    function isHotspotStep(step) { return step.mode === 'hotspot' && hotspotSteps.has(step.id); }
    function isHotspotDone(step) { return stepCompleted[step.id]; }
    function setStepDone(stepId) { if (stepCompleted.hasOwnProperty(stepId)) stepCompleted[stepId] = true; }

    function getSimulationPath(src) {
        if (!src) return src;

        if (src === 'protractor.png') {
            const protractorPath = 'images/simulation/' + src;
            return getAssetSrc(protractorPath);
        }

        if (selectedMaterial && selectedThickness) {
            const folderName = `${selectedMaterial}-${selectedThickness}`;
            const folderPath = src.replace('images/simulation/', `images/simulation/${folderName}/`);
            return getAssetSrc(folderPath);
        }

        return getAssetSrc(src);
    }

    function showCurrentStep() {
        if (!gifContainer) return;
        document.body.classList.remove('result-mode');
        const step = steps[currentStepIndex];
        const timestamp = Date.now();
        clearCleanup();

        if (nextButton) nextButton.disabled = true;

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

        if (nextButton && currentStepIndex === totalSteps - 1) {
            nextButton.disabled = true;
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
                if (nextButton) nextButton.disabled = true;
            }
        }
    }

    function renderSchematicStep(step, timestamp) {
        const schematicImage = selectedThickness === '5mm' ? '5mm.png' : '1mm.png';
        const imagePath = getSimulationPath(`images/simulation/${schematicImage}`);
        const formattedPath = formatSrc(imagePath, timestamp);

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="schematic-stage" style="display: flex; align-items: center; justify-content: center;">
                            <img id="schematic-img" src="${formattedPath}" alt="Schematic Diagram" style="width: 100%; height: auto; object-fit: contain;" />
                        </div>
                    </div>
                </div>
                <div class="drag-instructions">
                    ${step.instruction}<br>
                    Click next to: ${stepGuidance.step0_5.next}
                </div>
            </div>
        `;

        const img = document.getElementById('schematic-img');
        img.addEventListener('load', () => {
            updateScaling();
            window.addEventListener('resize', updateScaling);
        });

        if (nextButton) nextButton.disabled = (currentStepIndex === totalSteps - 1);
    }

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

    function getSnapRotation(stepId) {
        if (stepId === 'step4_5') {
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm') return 323;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm') return 323;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm') return 323;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm') return 323;
        } else if (stepId === 'step5_5') {
            if (selectedMaterial == 'aluminium' && selectedThickness == '1mm') return 326;
            if (selectedMaterial == 'aluminium' && selectedThickness == '5mm') return 326;
            if (selectedMaterial == 'brass' && selectedThickness == '1mm') return 327;
            if (selectedMaterial == 'brass' && selectedThickness == '5mm') return 324;
            if (selectedMaterial == 'steel' && selectedThickness == '1mm') return 333;
            if (selectedMaterial == 'steel' && selectedThickness == '5mm') return 328;
        }
        return 0;
    }

    function renderHotspotFirstFrame(step, timestamp) {
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
        const videoSrc = getSimulationPath(step.src);
        const formattedVideoSrc = formatSrc(videoSrc, timestamp);

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formattedVideoSrc}" style="width:100%;height:auto;" preload="auto" playsinline muted></video>
                            <button id="play-hotspot" class="play-hotspot" style="visibility:hidden;"></button>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
            </div>`;

        const stage = document.getElementById('play-stage');
        const video = document.getElementById('step-video');
        const hotspot = document.getElementById('play-hotspot');
        const instructionElem = document.getElementById('play-instruction');

        function layoutHotspot() {
            if (!stage) return;
            const w = stage.offsetWidth;
            const h = stage.offsetHeight;
            hotspot.style.left = (w * cfg.x) + 'px';
            hotspot.style.top = (h * cfg.y) + 'px';
            hotspot.style.width = (w * cfg.w) + 'px';
            hotspot.style.height = (h * cfg.h) + 'px';
        }

        function showHotspot() {
            instructionElem.textContent = initialInstruction;
            layoutHotspot();
            hotspot.style.visibility = 'visible';
            hotspot.classList.add('debug-highlight');
        }

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 0.01;
            video.pause();
            showHotspot();
            updateScaling();
            window.addEventListener('resize', updateScaling);
        }, { once: true });

        hotspot.addEventListener('click', () => {
            hotspot.style.visibility = 'hidden';
            instructionElem.textContent = '  ';
            video.play().catch(() => { });
        }, { once: true });

        video.addEventListener('ended', () => {
            instructionElem.innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
            if (nextButton) nextButton.disabled = false;
            setStepDone(step.id);
        }, { once: true });

        window.addEventListener('resize', () => { layoutHotspot(); updateScaling(); });

        cleanupCurrent = function () {
        };
    }

    function renderAutoplayStep(step, timestamp) {
        const videoSrc = getSimulationPath(step.src);
        const formattedVideoSrc = formatSrc(videoSrc, timestamp);
        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="play-stage" id="play-stage">
                            <video id="step-video" src="${formattedVideoSrc}" style="width:100%;height:auto;" playsinline muted></video>
                        </div>
                    </div>
                </div>
                <div id="play-instruction" class="drag-instructions" style="white-space: pre-line;"></div>
            </div>`;

        const video = document.getElementById('step-video');
        video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => { });
            updateScaling();
            window.addEventListener('resize', updateScaling);
        }, { once: true });

        video.addEventListener('ended', () => {
            if (document.getElementById('play-instruction')) {
                document.getElementById('play-instruction').innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
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

        const backgroundPng = getSimulationPath(step.background);
        const toolPng = getSimulationPath(step.tool);
        const formattedBgSrc = formatSrc(backgroundPng, timestamp);
        const formattedToolSrc = formatSrc(toolPng, timestamp);
        const tolerancePx = step.tolerance || 50;

        const arrowTop = step.arrow?.top || '-370%';
        const arrowLeft = step.arrow?.left || '643%';

        gifContainer.innerHTML = `
            <div class="gif-wrapper">
                <h3>${step.title}</h3>
                <div class="step-indicator">Step ${currentStepIndex + 1} of ${totalSteps}</div>
                <div class="sim-media-container">
                    <div class="scaling-wrapper">
                        <div class="drag-stage" id="drag-stage">
                            <img src="${formattedBgSrc}" alt="Background" class="stage-bg" id="drag-bg"/>
                            <img src="${formattedToolSrc}" alt="Tool" id="draggable-tool" class="draggable"/>
                            <div id="drop-zone" class="drop-zone" aria-hidden="true" style="visibility:hidden; --arrow-top: ${arrowTop}; --arrow-left: ${arrowLeft};"></div>
                        </div>
                    </div>
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
            dropZone.style.visibility = 'visible';
            applyToolSize();
            if (!toolMovedByUser && !toolPlacedInitially) placeToolInitial();
            updateScaling();
            window.addEventListener('resize', updateScaling);
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
            if (dropZone && dropZone.parentNode) {
                dropZone.classList.add('dragging-active');
            }
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

            dropZone.remove();

            const rotation = getSnapRotation(step.id);

            const onComplete = () => {
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
                    document.getElementById('drag-instruction').innerHTML = '<b>Step complete.</b> Click next to: ' + stepGuidance[step.id].next;
                } else if (dynInst && dynInst !== 'Click to continue.') {
                    document.getElementById('drag-instruction').textContent = dynInst + '\n\nClick next to: ' + stepGuidance[step.id].next;
                }

                if (nextButton) nextButton.disabled = false;
            };

            if (rotation) {
                const anchorPercentX = (anchor.x * 100).toFixed(1);
                const anchorPercentY = (anchor.y * 100).toFixed(1);

                document.getElementById('drag-instruction').textContent = "Click on the protractor to align it.";

                tool.style.cursor = 'pointer';
                const rotateOnClick = () => {
                    tool.style.cursor = 'default';
                    tool.style.transformOrigin = `${anchorPercentX}% ${anchorPercentY}%`;
                    tool.style.transform = `rotate(${rotation - 360}deg)`;

                    setTimeout(onComplete, 350);
                };
                setTimeout(() => {
                    tool.addEventListener('click', rotateOnClick, { once: true });
                    tool.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        rotateOnClick();
                    }, { once: true });
                }, 100);

            } else {
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

        let step3Angle, step4Angle, springBack;
        let matName = 'Aluminium';
        if (selectedMaterial === 'brass') matName = 'Brass';
        if (selectedMaterial === 'steel') matName = 'Mild Steel';

        if (selectedMaterial == 'aluminium') {
            if (selectedThickness == '1mm') {
                step3Angle = 106;
                step4Angle = 114;
            } else {
                step3Angle = 106;
                step4Angle = 110;
            }
        } else if (selectedMaterial == 'brass') {
            if (selectedThickness == '1mm') {
                step3Angle = 106;
                step4Angle = 112;
            } else {
                step3Angle = 106;
                step4Angle = 110;
            }
        } else {
            if (selectedThickness == '1mm') {
                step3Angle = 106;
                step4Angle = 126;
            } else {
                step3Angle = 106;
                step4Angle = 116;
            }
        }

        const bendAngle = 180 - step3Angle;
        const finalAngle = 180 - step4Angle;
        springBack = bendAngle - finalAngle;

        document.body.classList.add('result-mode');

        const resultImagePath = getSimulationPath('images/simulation/1-tool.png');
        const formattedResultImageSrc = formatSrc(resultImagePath, Date.now());

        gifContainer.innerHTML = `
            <div class="gif-wrapper print-area" style="overflow-y:auto; height:100%; display:block;">
                <h2 style="text-align:center;">EXPERIMENT OBSERVATION SHEET</h2>\n            <p style="text-align:center; margin-top:10px;"><b>Aim:</b> To determine the angle of a given workpiece using a sine bar.</p>

                <hr>

                <div style="text-align:center; margin:20px 0;">
                    <img src="${formattedResultImageSrc}" alt="${matName} ${selectedThickness}" style="max-width:400px; border:1px solid #ccc; border-radius:6px;">
                    <p style="font-size:14px; margin-top:6px;">Spring Back Effect Analysis for ${matName} (${selectedThickness})</p>
                </div>

                <table style="border-collapse:collapse; margin-top:20px; width:100%; max-width:700px; margin-left:auto; margin-right:auto; border:1px solid #000; font-family: sans-serif">
                    <tbody>
                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background-color: #f0f0f0;">Experiment Details</td>
                        </tr>
                         <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Experiment</td>
                            <td style="border:1px solid #000; padding:10px 15px;">Spring Back Effect Analysis</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Material Used</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${matName}</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Thickness</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${selectedThickness}</td>
                        </tr>

                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background-color: #f0f0f0;">Loaded State Measurements</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Protractor Reading</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${step3Angle}°</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Bend Angle (180° - Reading)</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${bendAngle}°</td>
                        </tr>

                        <tr>
                            <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background-color: #f0f0f0;">Unloaded State Measurements</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Protractor Reading</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${step4Angle}°</td>
                        </tr>
                         <tr>
                            <td style="border:1px solid #000; padding:10px 15px;">Final Bend Angle (180° - Reading)</td>
                            <td style="border:1px solid #000; padding:10px 15px;">${finalAngle}°</td>
                        </tr>

                        <tr>
                             <td colspan="2" style="border:1px solid #000; padding:10px 15px; font-weight:bold; background-color: #f0f0f0;">Result</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #000; padding:10px 15px;"><strong>Spring Back Angle</strong></td>
                            <td style="border:1px solid #000; padding:10px 15px;"><strong>${springBack}°</strong></td>
                        </tr>
                    </tbody>
                </table>

                <h3 style="margin-top:20px;">Conclusion</h3>
                <p>
                    The spring back effect was observed for ${matName} with ${selectedThickness} thickness.
                    The difference between the loaded bend angle and the final unloaded angle indicates the elastic recovery of the material.
                </p>

                <div class="no-print" style="text-align:center; margin-top:30px; margin-bottom:20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 4px;">🖨 Print Observation Sheet</button>
                </div>
            </div>
        `;
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

    preloadAssets();
});
