const backgroundImages = ['left.png', 'left_2.png'];
let currentImageIndex = 0;
const leftSection = document.querySelector('.left');

function changeBackground() {
    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    leftSection.style.backgroundImage = `url('images/${backgroundImages[currentImageIndex]}')`;
}

// 每5秒切换一次背景
setInterval(changeBackground, 5000);

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

// 页面加载时更新位置
document.addEventListener('DOMContentLoaded', updateLocation);
