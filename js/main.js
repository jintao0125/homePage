const backgroundImages = ['left.png', 'left_2.png'];
let currentImageIndex = 0;
const leftSection = document.querySelector('.left');

function changeBackground() {
    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    leftSection.style.backgroundImage = `url('images/${backgroundImages[currentImageIndex]}')`;
}

// 每5秒切换一次背景
setInterval(changeBackground, 5000);
