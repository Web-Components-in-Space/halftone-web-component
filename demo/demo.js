let backgroundImage;
let timer;

document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('camera')) {
        document.getElementById('halftone').setAttribute('src', 'camera');
    }
});

function changeShape(event) {
    document.getElementById('halftone').setAttribute('shapetype', event.target.value);

    if (event.target.value === 'crosses') {
        document.getElementById('crosssize-container').style.display = 'block';
    } else {
        document.getElementById('crosssize-container').style.display = 'none';
    }
}

function downloadSVG() {
    const dl = document.createElement('a');
    const data = "data:image/svg+xml," + escape(document.getElementById('halftone').getSVG())
    dl.setAttribute('download', 'halftone.svg');
    dl.setAttribute('href', data);
    dl.click();
}

function downloadImageSVG() {
    let rendered = false;
    const ht = document.getElementById('halftone');
    const imgA = document.createElement('img');
    const imgB = document.createElement('img');
    let svg64 = btoa(ht.getSVG());
    let b64Start = 'data:image/svg+xml;base64,';
    let image64 = b64Start + svg64;

    const composite = () => {
        if (!rendered && imgA.complete && (imgB.complete || backgroundImage)) {
            const canvas = document.createElement('canvas');
            canvas.width = ht.contentWidth;
            canvas.height = ht.contentHeight;
            const ctx = canvas.getContext('2d');

            if (backgroundImage) {
                drawBackgroundImage(ctx, imgB);
            }
            ctx.drawImage(imgA, 0, 0);
            downloadCanvasAsImage(canvas);
            rendered = true;
        }
    }

    imgA.onload = () => composite();
    imgB.onload = () => composite();

    imgA.src = image64;
    if (backgroundImage) {
        imgB.src = backgroundImage;
    }
}

function downloadImageCanvas() {
    const ht = document.getElementById('halftone');
    const bg = document.createElement('img');

    const composite = () => {
        const canvas = document.createElement('canvas');
        canvas.width = ht.contentWidth;
        canvas.height = ht.contentHeight;
        const ctx = canvas.getContext('2d');
        if (bg) {
            if (backgroundImage) {
                drawBackgroundImage(ctx, bg);
            }
            ctx.drawImage(ht.renderSurface, 0, 0);
            downloadCanvasAsImage(canvas);
        }
    }

    if (backgroundImage) {
        bg.src = backgroundImage;
        bg.onload = () => composite();
    } else {
        composite();
    }
}

function downloadCanvasAsImage(canvas) {
    const pngdata = canvas.toDataURL('image/png');
    const dl = document.createElement('a');
    dl.setAttribute('download', 'halftone.png');
    dl.setAttribute('href', pngdata);
    dl.click();
}

function changeDistance(event) {
    if (timer) {
        clearTimeout(timer);
    }
    setTimeout( () => {
        document.getElementById('halftone').setAttribute('distance', event.target.value);
    }, 500);
}


function changeInverse(event) {
    if (event.target.checked) {;
        document.getElementById('halftone').setAttribute('inverse', true);
    } else {
        document.getElementById('halftone').removeAttribute('inverse');
    }
}

function changeDoConstrain(event) {
    if (event.target.checked) {
        document.getElementById('constraintsize').disabled = false;
        document.getElementById('constraintsizevalue').innerHTML = document.getElementById('constraintsize').value + 'px';
        document.getElementById('halftone').setAttribute('inputsizeconstraint', document.getElementById('constraintsize').value);
    } else {
        document.getElementById('constraintsize').disabled = true;
        document.getElementById('constraintsizevalue').innerHTML = '';
        document.getElementById('halftone').removeAttribute('inputsizeconstraint');
    }
}

function changeConstraintSize(event) {
    if (document.getElementById('doconstrain').checked) {
        document.getElementById('constraintsizevalue').innerHTML = event.target.value + 'px';
        document.getElementById('halftone').setAttribute('inputsizeconstraint', event.target.value);
    }
}

function changeCrossSize(event) {
    if (timer) {
        clearTimeout(timer);
    }
    setTimeout( () => {
        document.getElementById('halftone').setAttribute('crossbarlength', event.target.value);
    }, 500);
}

function changeFillColor(event) {
    if (timer) {
        clearTimeout(timer);
    }
    setTimeout( () => {
        document.getElementById('halftone').setAttribute('shapecolor', event.target.value);
    }, 500);
}

function changeRefreshRate(event) {
    document.getElementById('halftone').setAttribute('refreshrate', event.target.value);
}

function changeBackgroundColor(event) {
    if (timer) {
        clearTimeout(timer);
    }
    setTimeout( () => {
        document.getElementById('bgimage').style.backgroundColor = event.target.value;
    }, 500);s
}

function changeBGImage(event) {
    backgroundImage = event.target.value;
    document.getElementById('bgimage').style.backgroundImage = `url("${backgroundImage}")`;
}

function uploadBGImage(event) {
    backgroundImage = URL.createObjectURL(event.target.files[0]);
    document.getElementById('bgimage').style.backgroundImage = `url("${backgroundImage}")`;
}

function changeSrcImage(event) {
    document.getElementById('halftone').setAttribute('src', event.target.value);
}

function uploadSrcImage(event) {
    document.getElementById('halftone').setAttribute('src', URL.createObjectURL(event.target.files[0]));
}

function drawBackgroundImage(ctx, srccanvas, offsetX = 0.5, offsetY = 0.5) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = srccanvas.width,
        ih = srccanvas.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(srccanvas, cx, cy, cw, ch, 0, 0, w, h);
}
