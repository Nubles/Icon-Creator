document.addEventListener('DOMContentLoaded', () => {
    const controls = {
        algorithm: document.getElementById('algorithm'),
        aFrequency: document.getElementById('a-frequency'),
        bFrequency: document.getElementById('b-frequency'),
        phaseShift: document.getElementById('phase-shift'),
        spiroR: document.getElementById('spiro-R'),
        spiro_r: document.getElementById('spiro-r'),
        spiroD: document.getElementById('spiro-d'),
        detailPoints: document.getElementById('detail-points'),
        strokeWidth: document.getElementById('stroke-width'),
        strokeColor: document.getElementById('stroke-color'),
        fillToggle: document.getElementById('fill-toggle'),
    };

    const values = {
        aFrequency: document.getElementById('a-frequency-value'),
        bFrequency: document.getElementById('b-frequency-value'),
        phaseShift: document.getElementById('phase-shift-value'),
        spiroR: document.getElementById('spiro-R-value'),
        spiro_r: document.getElementById('spiro-r-value'),
        spiroD: document.getElementById('spiro-d-value'),
        detailPoints: document.getElementById('detail-points-value'),
        strokeWidth: document.getElementById('stroke-width-value'),
    };

    const lissajousControls = document.getElementById('lissajous-controls');
    const spirographControls = document.getElementById('spirograph-controls');
    const svgContainer = document.getElementById('svg-container');
    const codeOutput = document.getElementById('code-output');
    const copyButton = document.getElementById('copy-button');
    const downloadSvgButton = document.getElementById('download-svg-button');
    const downloadPngButton = document.getElementById('download-png-button');
    const presetNameInput = document.getElementById('preset-name');
    const savePresetButton = document.getElementById('save-preset-button');
    const presetList = document.getElementById('preset-list');
    const loadPresetButton = document.getElementById('load-preset-button');
    const deletePresetButton = document.getElementById('delete-preset-button');
    const randomizeButton = document.getElementById('randomize-button');

    let currentSvgCode = '';

    const updateUI = () => {
        values.aFrequency.textContent = controls.aFrequency.value;
        values.bFrequency.textContent = controls.bFrequency.value;
        values.phaseShift.textContent = parseFloat(controls.phaseShift.value).toFixed(2);
        values.spiroR.textContent = controls.spiroR.value;
        values.spiro_r.textContent = controls.spiro_r.value;
        values.spiroD.textContent = controls.spiroD.value;
        values.detailPoints.textContent = controls.detailPoints.value;
        values.strokeWidth.textContent = controls.strokeWidth.value;
    };

    const generateSVG = () => {
        updateUI();
        const algorithm = controls.algorithm.value;
        const points = parseInt(controls.detailPoints.value);
        const strokeWidth = parseInt(controls.strokeWidth.value);
        const strokeColor = controls.strokeColor.value;
        const closeAndFill = controls.fillToggle.checked;
        const width = 400;
        const height = 400;
        const padding = 20;

        let pathData = '';

        if (algorithm === 'lissajous') {
            const a = parseInt(controls.aFrequency.value);
            const b = parseInt(controls.bFrequency.value);
            const delta = parseFloat(controls.phaseShift.value);
            const scale = (width - 2 * padding) / 2;
            for (let i = 0; i <= points; i++) {
                const t = (2 * Math.PI / points) * i;
                const x = scale * Math.sin(a * t + delta) + width / 2;
                const y = scale * Math.sin(b * t) + height / 2;
                pathData += (i === 0 ? 'M' : 'L') + `${x.toFixed(2)} ${y.toFixed(2)} `;
            }
        } else if (algorithm === 'spirograph') {
            const R = parseInt(controls.spiroR.value);
            const r = parseInt(controls.spiro_r.value);
            const d = parseInt(controls.spiroD.value);
            const scale = (width - 2 * padding) / (2 * (R + r));
            for (let i = 0; i <= points; i++) {
                const t = (8 * Math.PI / points) * i;
                const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
                const y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);
                pathData += (i === 0 ? 'M' : 'L') + `${(scale * x) + width/2} ${(scale*y) + height/2} `;
            }
        }

        values.detailPoints.textContent = points;
        values.strokeWidth.textContent = strokeWidth;

        if (closeAndFill) {
            pathData += 'Z';
        }

        const fill = closeAndFill ? '#4A90E2' : 'none';
        currentSvgCode = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fill}" />
</svg>`;

        svgContainer.innerHTML = currentSvgCode;
        codeOutput.value = currentSvgCode.replace(/></g, '>\n    <').replace(/ \/>/g, ' />\n');
    };

    downloadSvgButton.addEventListener('click', () => {
        const blob = new Blob([currentSvgCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logo.svg';
        a.click();
        URL.revokeObjectURL(url);
    });

    downloadPngButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        canvg(canvas, currentSvgCode, {
            ignoreMouse: true,
            ignoreAnimation: true,
            renderCallback: () => {
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = 'logo.png';
                a.click();
            }
        });
    });

    controls.algorithm.addEventListener('change', () => {
        if (controls.algorithm.value === 'lissajous') {
            lissajousControls.classList.remove('hidden');
            spirographControls.classList.add('hidden');
        } else {
            lissajousControls.classList.add('hidden');
            spirographControls.classList.remove('hidden');
        }
        generateSVG();
    });

    Object.values(controls).forEach(control => {
        control.addEventListener('input', generateSVG);
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(codeOutput.value).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy SVG Code';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    const populatePresetList = () => {
        presetList.innerHTML = '';
        const presets = JSON.parse(localStorage.getItem('svgGeneratorPresets')) || {};
        for (const name in presets) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            presetList.appendChild(option);
        }
    };

    const savePreset = () => {
        const name = presetNameInput.value.trim();
        if (!name) {
            alert('Please enter a name for the preset.');
            return;
        }
        const presets = JSON.parse(localStorage.getItem('svgGeneratorPresets')) || {};
        presets[name] = {
            algorithm: controls.algorithm.value,
            aFrequency: controls.aFrequency.value,
            bFrequency: controls.bFrequency.value,
            phaseShift: controls.phaseShift.value,
            spiroR: controls.spiroR.value,
            spiro_r: controls.spiro_r.value,
            spiroD: controls.spiroD.value,
            detailPoints: controls.detailPoints.value,
            strokeWidth: controls.strokeWidth.value,
            strokeColor: controls.strokeColor.value,
            fillToggle: controls.fillToggle.checked,
        };
        localStorage.setItem('svgGeneratorPresets', JSON.stringify(presets));
        populatePresetList();
        presetNameInput.value = '';
    };

    const loadPreset = () => {
        const name = presetList.value;
        if (!name) return;
        const presets = JSON.parse(localStorage.getItem('svgGeneratorPresets')) || {};
        const preset = presets[name];
        if (preset) {
            controls.algorithm.value = preset.algorithm;
            controls.aFrequency.value = preset.aFrequency;
            controls.bFrequency.value = preset.bFrequency;
            controls.phaseShift.value = preset.phaseShift;
            controls.spiroR.value = preset.spiroR;
            controls.spiro_r.value = preset.spiro_r;
            controls.spiroD.value = preset.spiroD;
            controls.detailPoints.value = preset.detailPoints;
            controls.strokeWidth.value = preset.strokeWidth;
            controls.strokeColor.value = preset.strokeColor;
            controls.fillToggle.checked = preset.fillToggle;

            // Trigger UI update
            generateSVG();

            // Show/hide controls based on loaded algorithm
            if (preset.algorithm === 'lissajous') {
                lissajousControls.classList.remove('hidden');
                spirographControls.classList.add('hidden');
            } else {
                lissajousControls.classList.add('hidden');
                spirographControls.classList.remove('hidden');
            }
        }
    };

    const deletePreset = () => {
        const name = presetList.value;
        if (!name) return;
        const presets = JSON.parse(localStorage.getItem('svgGeneratorPresets')) || {};
        delete presets[name];
        localStorage.setItem('svgGeneratorPresets', JSON.stringify(presets));
        populatePresetList();
    };

    const randomize = () => {
        if (controls.algorithm.value === 'lissajous') {
            controls.aFrequency.value = Math.floor(Math.random() * 20) + 1;
            controls.bFrequency.value = Math.floor(Math.random() * 20) + 1;
            controls.phaseShift.value = (Math.random() * 6.28).toFixed(2);
        } else {
            controls.spiroR.value = Math.floor(Math.random() * 200) + 1;
            controls.spiro_r.value = Math.floor(Math.random() * 200) + 1;
            controls.spiroD.value = Math.floor(Math.random() * 200) + 1;
        }
        controls.detailPoints.value = Math.floor(Math.random() * 1901) + 100;
        controls.strokeWidth.value = Math.floor(Math.random() * 10) + 1;
        controls.strokeColor.value = `#${('000000' + Math.floor(Math.random()*16777215).toString(16)).slice(-6)}`;
        controls.fillToggle.checked = Math.random() < 0.5;
        generateSVG();
    };

    savePresetButton.addEventListener('click', savePreset);
    loadPresetButton.addEventListener('click', loadPreset);
    deletePresetButton.addEventListener('click', deletePreset);
    randomizeButton.addEventListener('click', randomize);

    populatePresetList();
    generateSVG();
});