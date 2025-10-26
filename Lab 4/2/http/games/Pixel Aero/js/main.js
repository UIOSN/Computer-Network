// 设置全屏
function resizeCanvas() {
    CONFIG.canvas.width = window.innerWidth;
    CONFIG.canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
createStars();

// CONFIG.bgMusic.autoplay = true; // 自动播放
// CONFIG.bgMusic.loop = true; // 循环播放
// CONFIG.bgMusic.volume = 1; // 设置音量

// CONFIG.homepageMusic.autoplay = true;
// CONFIG.homepageMusic.loop = true;
// CONFIG.homepageMusic.volume = 1;
//const brightColors = ['#00FFFF', '#FFD700', '#FFA500', '#ff0080', '#00BFFF',"#FF0000","#800080"]; //蓝色、黄色、橙色、粉色、深蓝色、红色、紫色

// 点击特效
window.addEventListener("click", (e) => {
    CONFIG.bullets.push({
        x: CONFIG.player.x + CONFIG.player.width / 2 - 5,
        y: CONFIG.player.y,
        width: 10,
        height: 20,
        speed: 30,
        color: brightColors[Math.floor(Math.random() * brightColors.length)],
        is_special: false,
    }); // 添加子弹
    CONFIG.bulletSound.currentTime = 0;
    CONFIG.bulletSound.volume = 0.3; // 设置音量
    CONFIG.bulletSound.play(); // 播放子弹音效
});
// window.addEventListener('contextmenu', (e) => {//特殊子弹发射
//     CONFIG.specialBulletsLeft--; // 减少特殊子弹次数
//     CONFIG.bullets.push({
//       x: CONFIG.player.x + CONFIG.player.width / 2 - 180, // 调整子弹的 x 坐标
//       y: CONFIG.player.y,
//       width: 360, // 特殊子弹宽度是普通子弹的三倍
//       height: 60, // 特殊子弹高度是普通子弹的三倍
//       speed: 4,
//       isSpecial: true, // 标记为特殊子弹
//       color: brightColors[Math.floor(Math.random() * brightColors.length)] // 特殊子弹的光效颜色
//     });
//     CONFIG.bulletSound.currentTime = 0;
//     CONFIG.bulletSound.play(); // 播放子弹音效
//   });
// 监听特殊子弹发射

window.addEventListener("keydown", (e) => {
    // 如果按下的是 Shift 键，并且还有特殊子弹次数
    CONFIG.keys[e.key] = true; // 设置键盘状态为按下
    if (e.code === "ShiftLeft" && CONFIG.specialBulletsLeft > 0) {
        //if(!CONFIG.keys[e.key]) CONFIG.keys[e.key] = true; // 设置键盘状态为按下
        CONFIG.specialBulletsLeft--; // 减少特殊子弹次数
        CONFIG.bullets.push({
            x: CONFIG.player.x + CONFIG.player.width / 2 - 180, // 调整子弹的 x 坐标
            y: CONFIG.player.y,
            width: 360, // 特殊子弹宽度是普通子弹的三倍
            height: 60, // 特殊子弹高度是普通子弹的三倍
            speed: 4,
            isSpecial: true, // 标记为特殊子弹
            color: brightColors[
                Math.floor(Math.random() * brightColors.length)
            ], // 特殊子弹的光效颜色
        });
        CONFIG.bulletSound.currentTime = 0;
        CONFIG.bulletSound.play(); // 播放子弹音效
    }
    if (e.code === "Space") {
        // 如果是 Game Over 界面，禁止触发暂停逻辑
        if (CONFIG.gameOverOverlay) {
            e.preventDefault(); // 禁止默认行为
            return;
        }

        // 如果不是 Game Over 界面，处理暂停逻辑
        if (!CONFIG.isPaused) {
            pauseGame();
        } else {
            resumeGame();
        }
    }
});
// 监听键盘事件
// 设置全局光标样式
document.body.style.cursor = "url('image/custom-cursor.png'), auto";
CONFIG.player.image.src = "image/plane.png"; // 玩家飞机图片
// 全局监听键盘事件
//window.addEventListener('keydown', (e) => CONFIG.keys[e.key] = true);
window.addEventListener("keyup", (e) => (CONFIG.keys[e.key] = false));
//CONFIG.player.image.src = 'image/rocket.png'; // 玩家飞机图片
CONFIG.backgroundImage.src = "image/bgi_33.jpg"; // 背景图片
// CONFIG.bgMusic.volume = 0.8
CONFIG.bgMusicIndex = Math.floor(Math.random() * CONFIG.bgMusicList.length); // 随机选择背景音乐
CONFIG.homepageMusicIndex = Math.floor(
    Math.random() * CONFIG.homepageMusicList.length
); // 随机选择主页音乐

// 显示主界面
showStartScreen();
