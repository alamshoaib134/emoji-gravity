const canvas = document.getElementById('emojiCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.querySelector('.clear-button').offsetHeight;

const emojis = ['©️', '®️', '‼️', '⁉️', '™️', 'ℹ️', '↔️', '↕️', '↖️', '↗️', '↘️', '↙️', '↩️', '↪️', '⌚️', '⌛️', '⌨️', '⏏️', '⏩️', '⏪️', '⏫️', '⏬️', '⏭️', '⏮️', '⏯️', '⏰️', '⏱️', '⏲️', '⏳️', '⏸️', '⏹️', '⏺️', 'Ⓜ️', '▪️', '▫️', '▶️', '◀️', '◻️', '◼️', '◽️', '◾️', '☀️', '☁️', '☂️', '☃️', '☄️', '☎️', '☑️', '☔️', '☕️', '☘️', '☝️', '☠️', '☢️', '☣️', '☦️', '☪️', '☮️', '☯️', '☸️', '☹️', '☺️', '♀️', '♂️', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '♟️', '♠️', '♣️', '♥️', '♦️', '♨️', '♻️', '♾️', '♿️', '⚒️', '⚓️', '⚔️', '⚕️', '⚖️', '⚗️', '⚙️', '⚛️', '⚜️', '⚠️', '⚡️', '⚧️', '⚪️', '⚫️', '⚰️', '⚱️', '⚽️', '⚾️', '⛄️', '⛅️', '⛈️', '⛎️', '⛏️', '⛑️', '⛓️', '⛔️', '⛩️', '⛪️', '⛰️', '⛱️', '⛲️', '⛳️', '⛴️', '⛵️', '⛷️', '⛸️', '⛹️', '⛺️', '⛽️', '✂️', '😀','😁',	'😂',	'😃',	'😄',	'😅',	'😆',	'😇',	'😈',	'😉',	'😊',	'😋',	'😌',	'😍',	'😎',	'😏',
'😐','😑',	'😒',	'😓',	'😔',	'😕',	'😖',	'😗',	'😘',	'😙',	'😚',	'😛',	'😜',	'😝',	'😞',	'😟',
'😠','😡',	'😢',	'😣',	'😤',	'😥',	'😦',	'😧',	'😨',	'😩',	'😪',	'😫',	'😬',	'😭',	'😮',	'😯',
'😰','😱',	'😲',	'😳',	'😴',	'😵',	'😶',	'😷',	'😸',	'😹',	'😺',	'😻',	'😼',	'😽',	'😾',	'😿',
'🙀','🙁',	'🙂',	'🙃',	'🙄',	'🙅',	'🙆',	'🙇',	'🙈',	'🙉',	'🙊',	'🙋',	'🙌',	'🙍',	'🙎',	'🙏'];
const gravity = 0.2;
const bounceFactor = -0.7;
const friction = 0.97;

const collisionSound = new Audio('collision.mp3');
collisionSound.addEventListener('canplaythrough', () => {
    console.log('Sound is ready to play');
});

let partitionY = canvas.height / 2;
let partitionSpeed = 2;

let isSolid = false;
let isSoundOn = true;
let isGravityOn = true;
let emojiSize = 20;
let isRandomSize = false;

function toggleSolid() {
    isSolid = !isSolid;
}

function toggleSound() {
    isSoundOn = !isSoundOn;
}

function toggleGravity() {
    isGravityOn = !isGravityOn;
}

function setRandomSize() {
    isRandomSize = true;
}

function toggleRandomSize() {
    isRandomSize = !isRandomSize;
}

function changeEmojiSize(event) {
    emojiSize = event.target.value;
    isRandomSize = false;
}

class Emoji {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = isRandomSize ? Math.random() * 40 + 10 : Math.random() * 10 + parseInt(emojiSize);
        this.dx = (Math.random() - 0.5) * 10;
        this.dy = (Math.random() - 0.5) * 10;
        this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
    }

    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        if (isGravityOn) {
            this.dy += gravity;
        }
        this.x += this.dx;
        this.y += this.dy;

        // Check collision with canvas boundaries
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
            this.dx *= bounceFactor;
        }
        if (this.y + this.size > canvas.height) {
            this.y = canvas.height - this.size;
            this.dy *= bounceFactor;
            this.dx *= friction;
        }

        this.draw();
    }

    checkCollision(otherEmoji) {
        const dx = this.x - otherEmoji.x;
        const dy = this.y - otherEmoji.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + otherEmoji.size;
    }

    resolveCollision(otherEmoji) {
        const dx = this.x - otherEmoji.x;
        const dy = this.y - otherEmoji.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = 0.5 * (distance - this.size - otherEmoji.size);

        this.x -= overlap * (this.x - otherEmoji.x) / distance;
        this.y -= overlap * (this.y - otherEmoji.y) / distance;
        otherEmoji.x += overlap * (this.x - otherEmoji.x) / distance;
        otherEmoji.y += overlap * (this.y - otherEmoji.y) / distance;

        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        const v1 = { x: this.dx * cos + this.dy * sin, y: this.dy * cos - this.dx * sin };
        const v2 = { x: otherEmoji.dx * cos + otherEmoji.dy * sin, y: otherEmoji.dy * cos - otherEmoji.dx * sin };

        const m1 = this.size;
        const m2 = otherEmoji.size;

        const u1 = { x: (v1.x * (m1 - m2) + 2 * m2 * v2.x) / (m1 + m2), y: v1.y };
        const u2 = { x: (v2.x * (m2 - m1) + 2 * m1 * v1.x) / (m1 + m2), y: v2.y };

        this.dx = u1.x * cos - u1.y * sin;
        this.dy = u1.y * cos + u1.x * sin;
        otherEmoji.dx = u2.x * cos - u2.y * sin;
        otherEmoji.dy = u2.y * cos + u2.x * sin;

        // Play collision sound
        if (isSoundOn && collisionSound.readyState >= 2) {
            const soundClone = collisionSound.cloneNode();
            soundClone.currentTime = 0; // Reset the sound to start
            soundClone.play().catch(error => console.log('Error playing sound:', error));
        }
    }
}

let emojiArray = [];

const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');
graphCanvas.width = 300;
graphCanvas.height = 150;

let emojiCounts = [];
let maxCount = 10;

let animatedEmojiCounts = [];
let animationFrame = 0;
const animationDuration = 30;

function updateGraph() {
    emojiCounts.push(emojiArray.length);
    if (emojiCounts.length > 30) {
        emojiCounts.shift(); // Keep only the last 30 data points
    }

    maxCount = Math.max(maxCount, ...emojiCounts);

    // Initialize animated counts
    if (animatedEmojiCounts.length === 0) {
        animatedEmojiCounts = [...emojiCounts];
    }

    animateGraph();
}

function animateGraph() {
    animationFrame++;
    if (animationFrame > animationDuration) {
        animationFrame = 0;
        animatedEmojiCounts = [...emojiCounts];
        drawGraph();
        return;
    }

    for (let i = 0; i < emojiCounts.length; i++) {
        animatedEmojiCounts[i] += (emojiCounts[i] - animatedEmojiCounts[i]) / (animationDuration - animationFrame);
    }

    drawGraph();
    requestAnimationFrame(animateGraph);
}

function drawGraph() {
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    // Set transparency
    graphCtx.globalAlpha = 1.0;

    // Draw grid lines
    graphCtx.strokeStyle = '#e0e0e0';
    for (let i = 0; i <= 30; i += 5) {
        graphCtx.beginPath();
        graphCtx.moveTo(i * (graphCanvas.width / 30) + 30, 0);
        graphCtx.lineTo(i * (graphCanvas.width / 30) + 30, graphCanvas.height - 20);
        graphCtx.stroke();
    }
    for (let i = 0; i <= maxCount; i += Math.ceil(maxCount / 5)) {
        graphCtx.beginPath();
        graphCtx.moveTo(30, graphCanvas.height - 20 - (i / maxCount) * (graphCanvas.height - 20));
        graphCtx.lineTo(graphCanvas.width, graphCanvas.height - 20 - (i / maxCount) * (graphCanvas.height - 20));
        graphCtx.stroke();
    }

    // Draw axes
    graphCtx.beginPath();
    graphCtx.moveTo(30, graphCanvas.height - 20);
    graphCtx.lineTo(graphCanvas.width, graphCanvas.height - 20);
    graphCtx.lineTo(graphCanvas.width, 0);
    graphCtx.strokeStyle = '#000';
    graphCtx.stroke();

    // Draw x-axis labels
    graphCtx.font = '10px Arial';
    graphCtx.fillStyle = '#000';
    for (let i = 0; i <= 30; i += 5) {
        graphCtx.fillText(i, i * (graphCanvas.width / 30) + 30, graphCanvas.height - 5);
    }

    // Draw y-axis labels
    for (let i = 0; i <= maxCount; i += Math.ceil(maxCount / 5)) {
        graphCtx.fillText(i, 5, graphCanvas.height - (i / maxCount) * (graphCanvas.height - 20) - 20);
    }

    // Draw graph
    graphCtx.beginPath();
    graphCtx.moveTo(30, graphCanvas.height - 20 - (animatedEmojiCounts[0] / maxCount) * (graphCanvas.height - 20));
    for (let i = 1; i < animatedEmojiCounts.length; i++) {
        graphCtx.lineTo(i * (graphCanvas.width / 30) + 30, graphCanvas.height - 20 - (animatedEmojiCounts[i] / maxCount) * (graphCanvas.height - 20));
    }
    graphCtx.strokeStyle = '#6200ea';
    graphCtx.stroke();

    // Reset transparency
    graphCtx.globalAlpha = 1.0;
}

function resetGraph() {
    emojiCounts = [];
    maxCount = 10;
    updateGraph();
}

function updateEmojiCounter() {
    document.getElementById('emojiCounter').innerText = `Emojis: ${emojiArray.length}`;
}

function handleMouseDown(e) {
    const numberOfEmojis = Math.floor(Math.random() * 10) + 5;
    for (let i = 0; i < numberOfEmojis; i++) {
        emojiArray.push(new Emoji(e.clientX, e.clientY));
    }
    updateEmojiCounter();
    updateGraph();
}

function clearEmojis() {
    emojiArray = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateEmojiCounter();
    updateGraph();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < emojiArray.length; i++) {
        emojiArray[i].update();
        if (isSolid) {
            for (let j = i + 1; j < emojiArray.length; j++) {
                if (emojiArray[i].checkCollision(emojiArray[j])) {
                    emojiArray[i].resolveCollision(emojiArray[j]);
                }
            }
        }
    }
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', handleMouseDown);

animate();