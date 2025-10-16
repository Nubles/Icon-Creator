document.addEventListener('DOMContentLoaded', () => {
    const controls = {
        aFrequency: document.getElementById('a-frequency'),
        bFrequency: document.getElementById('b-frequency'),
        phaseShift: document.getElementById('phase-shift'),
        detailPoints: document.getElementById('detail-points'),
        strokeWidth: document.getElementById('stroke-width'),
        strokeColor: document.getElementById('stroke-color'),
        fillToggle: document.getElementById('fill-toggle'),
    };

    const values = {
        aFrequency: document.getElementById('a-frequency-value'),
        bFrequency: document.getElementById('b-frequency-value'),
        phaseShift: document.getElementById('phase-shift-value'),
        detailPoints: document.getElementById('detail-points-value'),
        strokeWidth: document.getElementById('stroke-width-value'),
    };

    const svgContainer = document.getElementById('svg-container');
    const codeOutput = document.getElementById('code-output');
    const copyButton = document.getElementById('copy-button');

    const generateSVG = () => {
        const a = parseInt(controls.aFrequency.value);
        const b = parseInt(controls.bFrequency.value);
        const delta = parseFloat(controls.phaseShift.value);
        const points = parseInt(controls.detailPoints.value);
        const strokeWidth = parseInt(controls.strokeWidth.value);
        const strokeColor = controls.strokeColor.value;
        const closeAndFill = controls.fillToggle.checked;

        values.aFrequency.textContent = a;
        values.bFrequency.textContent = b;
        values.phaseShift.textContent = delta.toFixed(2);
        values.detailPoints.textContent = points;
        values.strokeWidth.textContent = strokeWidth;

        const width = 400;
        const height = 400;
        const padding = 20;
        const scale = (width - 2 * padding) / 2;

        let pathData = '';
        for (let i = 0; i <= points; i++) {
            const t = (2 * Math.PI / points) * i;
            const x = scale * Math.sin(a * t + delta) + width / 2;
            const y = scale * Math.sin(b * t) + height / 2;
            pathData += (i === 0 ? 'M' : 'L') + `${x.toFixed(2)} ${y.toFixed(2)} `;
        }

        if (closeAndFill) {
            pathData += 'Z';
        }

        const fill = closeAndFill ? '#4A90E2' : 'none';
        const svgCode = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fill}" />
</svg>`;

        svgContainer.innerHTML = svgCode;
        codeOutput.value = svgCode.replace(/></g, '>\n    <').replace(/ \/>/g, ' />\n');
    };

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

    generateSVG();
});