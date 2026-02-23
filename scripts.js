const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const upload = document.getElementById('upload');
const zoomInput = document.getElementById('zoom');
const zoomPercent = document.getElementById('zoomPercent');
const posXInput = document.getElementById('posX');
const posYInput = document.getElementById('posY');
const downloadBtn = document.getElementById('downloadBtn');
const placeholder = document.getElementById('placeholder-text');
const controlsPanel = document.getElementById('controls-panel');
const customAlert = document.getElementById('custom-alert');

const FRAME_URL = 'no-boat-no-vote.png';

let userImg = new Image();
let frameImg = new Image();
let isUserImageLoaded = false;
let isFrameLoaded = false;
let baseFitScale = 1;

let isDragging = false;
let startX, startY;

canvas.width = 2048;
canvas.height = 2048;

frameImg.crossOrigin = "anonymous";
frameImg.onload = () => {
   isFrameLoaded = true;
   drawCanvas();
};
frameImg.src = FRAME_URL;

const toBengaliNumber = (num) => {
   const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
   return num.toString().replace(/\d/g, d => bengaliDigits[d]);
};

function copyHashtag() {
    const hashtag = "#NoBoatNoVote";
    navigator.clipboard.writeText(hashtag).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        
        btn.innerText = "কপি হয়েছে!";
        btn.style.color = "#4ADE80"; // সবুজ রঙ
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = ""; // আগের রঙে ফিরে যাবে
        }, 2000);
    });
}


window.adjust = (id, amount) => {
   const el = document.getElementById(id);
   const newVal = parseFloat(el.value) + amount;
   if (newVal >= el.min && newVal <= el.max) {
      el.value = newVal;
      drawCanvas();
   }
};

const startDrag = (e) => {
   if (!isUserImageLoaded) return;
   isDragging = true;
   const pos = getPos(e);
   startX = pos.x;
   startY = pos.y;
};

const moveDrag = (e) => {
   if (!isDragging) return;
   const pos = getPos(e);
   const rect = canvas.getBoundingClientRect();
   const scale = canvas.width / rect.width;

   const dx = (pos.x - startX) * scale;
   const dy = (pos.y - startY) * scale;

   posXInput.value = parseFloat(posXInput.value) + dx;
   posYInput.value = parseFloat(posYInput.value) + dy;

   startX = pos.x;
   startY = pos.y;
   drawCanvas();
};

const stopDrag = () => {
   isDragging = false;
};

const getPos = (e) => {
   const rect = canvas.getBoundingClientRect();
   const clientX = e.touches ? e.touches[0].clientX : e.clientX;
   const clientY = e.touches ? e.touches[0].clientY : e.clientY;
   return {
      x: clientX - rect.left,
      y: clientY - rect.top
   };
};

container.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', stopDrag);

container.addEventListener('touchstart', startDrag);
window.addEventListener('touchmove', moveDrag);
window.addEventListener('touchend', stopDrag);

upload.addEventListener('change', (e) => {
   const file = e.target.files[0];
   if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
         userImg.onload = () => {
            isUserImageLoaded = true;
            controlsPanel.classList.remove('hidden-controls');
            downloadBtn.classList.remove('hidden-controls');
            downloadBtn.classList.add('flex');
            placeholder.classList.add('hidden');

            const scaleX = canvas.width / userImg.width;
            const scaleY = canvas.height / userImg.height;
            baseFitScale = Math.max(scaleX, scaleY);

            zoomInput.value = 1;
            posXInput.value = 0;
            posYInput.value = 0;

            drawCanvas();

            // Show Warning
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            if (ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1) {
               customAlert.style.display = 'flex';
            }
         };
         userImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
   }
});

function drawCanvas() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "white";
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   const userZoom = parseFloat(zoomInput.value);
   zoomPercent.innerText = toBengaliNumber(Math.round(userZoom * 100)) + '%';

   if (isUserImageLoaded && userImg.complete) {
      const finalScale = baseFitScale * userZoom;
      const x = parseFloat(posXInput.value) + (canvas.width / 2);
      const y = parseFloat(posYInput.value) + (canvas.height / 2);
      const imgWidth = userImg.width * finalScale;
      const imgHeight = userImg.height * finalScale;
      ctx.save();
      ctx.drawImage(userImg, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();
   }

   if (isFrameLoaded && frameImg.complete) {
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
   }
}

[zoomInput, posXInput, posYInput].forEach(input => {
   input.addEventListener('input', drawCanvas);
});

// Advanced Download Method
downloadBtn.addEventListener('click', () => {
   try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Blob Download Link
      fetch(dataUrl)
         .then(res => res.blob())
         .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'NoBoatNoVote_' + Date.now() + '.jpg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
         });
   } catch (err) {
      // If download failed
      customAlert.style.display = 'flex';
   }

});
