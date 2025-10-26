// 生成背景星星
function createStars() {
    for (let i = 0; i < 500; i++) {
        CONFIG.backgroundStars.push({
            x: Math.random() * CONFIG.canvas.width,
            y: Math.random() * CONFIG.canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 2 + 0.5,
        });
    }
}
const brightColors = [
    "#00FFFF",
    "#FFD700",
    "#FFA500",
    "#ff0080",
    "#00BFFF",
    "#FF0000",
    "#800080",
]; //蓝色、黄色、橙色、粉色、深蓝色、红色、紫色

function generateStars() {
    if (CONFIG.backgroundStars.length < 200) {
        // 限制星星数量
        CONFIG.backgroundStars.push({
            x: Math.random() * CONFIG.canvas.width,
            y: 0,
            size: Math.random() * 2,
            speed: Math.random() * 2 + 0.5,
            color: brightColors[
                Math.floor(Math.random() * brightColors.length)
            ], // 从预定义颜色中选择
        });
    }
}

// function updateStars() {
//   backgroundStars.forEach((star) => {
//     star.y += star.speed;
//     if (star.y > canvas.height) {
//       star.y = 0; // 重置到顶部
//       star.x = Math.random() * canvas.width; // 随机水平位置
//     }
//   });
// }
