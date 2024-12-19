const backgroundImages = ['left.png', 'left_2.png'];
let currentImageIndex = 0;
const leftSection = document.querySelector('.left');

function changeBackground() {
    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    leftSection.style.backgroundImage = `url('images/${backgroundImages[currentImageIndex]}')`;
}

// 检测是否为移动设备
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 根据设备类型初始化页面
function initPage() {
    if (isMobile()) {
        // 移动设备下不执行背景切换
        if (window.changeBackgroundInterval) {
            clearInterval(window.changeBackgroundInterval);
        }
    } else {
        // 桌面设备才执行背景切换
        window.changeBackgroundInterval = setInterval(changeBackground, 5000);
    }
}

// 地理定位功能
function updateLocation() {
    const locationElement = document.querySelector('.zuobiao');
    let location = '中国·北京';  // 默认位置
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                // 使用高德地图API逆地理编码
                const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=78b3b30f1675e9093e37aab388fc06c1&location=${position.coords.longitude},${position.coords.latitude}&extensions=base&output=json`);
                const data = await response.json();
                
                if (data.status === '1') {
                    const addressComponent = data.regeocode.addressComponent;
                    location = `${addressComponent.country}·${addressComponent.city || addressComponent.province}`;
                }
            } catch (error) {
                console.log('获取位置信息失败:', error);
            }
            locationElement.textContent = location;
        }, (error) => {
            console.log('定位失败:', error);
            locationElement.textContent = location;
        });
    } else {
        locationElement.textContent = location;
    }
}

// 移动播放器到正确位置
function movePlayerOnMobile() {
    const player = document.querySelector('.music-player');
    if (isMobile()) {
        const mobileContainer = document.querySelector('.mobile-player');
        if (player && mobileContainer && player.parentNode !== mobileContainer) {
            mobileContainer.appendChild(player);
        }
    } else {
        const leftSection = document.querySelector('.left');
        if (player && leftSection && player.parentNode !== leftSection) {
            leftSection.appendChild(player);
        }
    }
}

// 页面加载和窗口大小改变时调用
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    updateLocation();
    movePlayerOnMobile();
    loadPlaylist();
});

window.addEventListener('resize', () => {
    movePlayerOnMobile();
});

// 音乐播放器功能
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');

let playlist = [];
let currentSongIndex = 0;

// 加载播放列表
function loadPlaylist() {
    // 首先尝试从上级目录的 music 文件夹加载
    fetch('../music/playlist.json')
        .then(response => {
            if (!response.ok) {
                // 如果失败，尝试从项目内的 music 文件夹加载
                return fetch('music/playlist.json');
            }
            return response;
        })
        .then(response => response.json())
        .then(data => {
            playlist = data;
            loadSong(currentSongIndex); // 加载第一首歌
        })
        .catch(error => {
            console.log('无法加载播放列表:', error);
        });
}

// 修改 loadSong 函数，处理相对路径
function loadSong(index) {
    const song = playlist[index];
    if (song) {
        // 如果歌曲 URL 不是以 http 开头，添加合适的前缀
        if (!/^https?:\/\//.test(song.url)) {
            // 判断音乐文件是否存在于上级目录的 music 文件夹
            fetch(`../${song.url}`)
                .then(response => {
                    if (response.ok) {
                        audio.src = `../${song.url}`;
                    } else {
                        // 否则从当前项目的 music 文件夹加载
                        audio.src = song.url;
                    }
                    songTitle.textContent = song.title;
                    songArtist.textContent = song.artist;
                    audio.load();
                })
                .catch(error => {
                    console.log('无法加载音乐文件:', error);
                });
        } else {
            // 绝对路径
            audio.src = song.url;
            songTitle.textContent = song.title;
            songArtist.textContent = song.artist;
            audio.load();
        }
    } else {
        console.log('播放列表为空或索引无效');
    }
}

// 播放控制
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '暂停';
    } else {
        audio.pause();
        playBtn.textContent = '播放';
    }
});

// 更新进度条
audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
});

// 切换歌曲
prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
    playBtn.textContent = '暂停';
});

nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
    playBtn.textContent = '暂停';
});
