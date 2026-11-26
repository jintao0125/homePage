/* ============================================================
 * jintao 的主页 — 参考 imsyy/home 功能组合
 * 模块：载入动画 / 时钟问候 / 一言 / 天气定位 / 时光进度条
 * ============================================================ */
'use strict';

/* ---------- 工具 ---------- */
const $ = (id) => document.getElementById(id);

/* ---------- 1. 载入动画 ---------- */
function initLoader() {
    const loader = $('loader');
    const hide = () => loader.classList.add('done');
    // 页面资源加载完即隐藏；兜底：3 秒后强制隐藏（防止某资源卡死一直挡屏）
    if (document.readyState === 'complete') {
        hide();
    } else {
        window.addEventListener('load', hide, { once: true });
        setTimeout(hide, 3000);
    }
}

/* ---------- 2. 时钟 / 日期 / 问候 ---------- */
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

function greetingText(hour) {
    if (hour < 5) return '夜深了，注意休息';
    if (hour < 9) return '早上好，新的一天加油';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好，记得吃饭';
    if (hour < 18) return '下午好';
    if (hour < 23) return '晚上好';
    return '夜深了，注意休息';
}

function initClock() {
    const clock = $('clock');
    const dateEl = $('date');
    const greeting = $('greeting');

    const tick = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        dateEl.textContent =
            `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${WEEK[now.getDay()]}`;
        greeting.textContent = greetingText(now.getHours());
    };
    tick();
    setInterval(tick, 1000);
}

/* ---------- 4. 一言（Hitokoto） ---------- */
const FALLBACK_QUOTES = [
    { text: '哪有什么天生如此，只是我们天天坚持。', from: '每日一言' },
    { text: '种一棵树最好的时间是十年前，其次是现在。', from: '谚语' },
    { text: '慢慢来，比较快。', from: '佚名' },
];

function initHitokoto() {
    const textEl = $('hitokoto-text');
    const fromEl = $('hitokoto-from');
    const render = (q) => {
        textEl.textContent = `「 ${q.text} 」`;
        fromEl.textContent = q.from ? `—— ${q.from}` : '';
    };

    fetch('https://v1.hitokoto.cn/?c=a&c=b&c=k&max_length=30')
        .then((r) => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
        })
        .then((data) => render({ text: data.hitokoto, from: data.from }))
        .catch(() => {
            const q = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            render(q);
        });
}

/* ---------- 5. 定位 + 高德天气 ---------- */
/* key 不在前端：走 nginx 反代 /api/amap/*，服务端拼接 key 转发高德 */
const DEFAULT_ADCODE = '110000'; // 定位失败时的兜底（北京）

async function fetchWeather(adcode) {
    const r = await fetch(`/api/amap/weather?city=${encodeURIComponent(adcode)}`);
    const data = await r.json();
    if (data.status !== '1' || !data.lives || !data.lives.length) throw new Error(data.info);
    const live = data.lives[0];
    return `${live.weather} ${live.temperature}°C · ${live.winddirection}风`;
}

async function fetchAdcode() {
    const pos = await new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) return reject(new Error('no geolocation'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    const { longitude, latitude } = pos.coords;
    const r = await fetch(`/api/amap/regeo?location=${longitude},${latitude}`);
    const data = await r.json();
    if (data.status !== '1') throw new Error(data.info);
    const ac = data.regeocode.addressComponent;
    return { adcode: ac.adcode || DEFAULT_ADCODE, city: ac.city || ac.province || '' };
}

function initWeather() {
    const weatherEl = $('weather');
    const locationEl = $('location');

    (async () => {
        let adcode = DEFAULT_ADCODE;
        try {
            const loc = await fetchAdcode();
            adcode = loc.adcode;
            if (loc.city) locationEl.textContent = loc.city;
        } catch (e) {
            // 定位被拒绝/失败：保留默认「中国·北京」，不打扰用户
            console.log('定位失败，使用默认城市:', e.message || e);
        }
        try {
            weatherEl.textContent = await fetchWeather(adcode);
        } catch (e) {
            // 获取失败：保留页面上的默认天气文案
            console.log('天气获取失败:', e.message || e);
        }
    })();
}

/* ---------- 6. 时光进度条 ---------- */
function initYearProgress() {
    const fill = $('yp-fill');
    const percent = $('yp-percent');

    const update = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear() + 1, 0, 1);
        const p = ((now - start) / (end - start)) * 100;
        fill.style.width = `${p.toFixed(1)}%`;
        percent.textContent = `${p.toFixed(1)}%`;
    };
    update();
    setInterval(update, 60 * 1000);
}

/* ---------- 启动 ---------- */
initLoader();
initClock();
initHitokoto();
initWeather();
initYearProgress();
