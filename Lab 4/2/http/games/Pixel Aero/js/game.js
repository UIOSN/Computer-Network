// 游戏主循环
let gameLoopId;
let lastFrameTime = 0;

function setupGameContainer() {
    // 创建游戏容器
    const gameContainer = document.createElement("div");
    gameContainer.id = "gameContainer";
    gameContainer.style.position = "absolute";
    gameContainer.style.top = "0";
    gameContainer.style.left = "0";
    gameContainer.style.width = "100%";
    gameContainer.style.height = "100%";
    gameContainer.style.backgroundImage = "url('image/bgi_3.jpg')"; // 替换为你的背景图片路径
    gameContainer.style.backgroundSize = "cover"; // 确保图片覆盖整个背景
    gameContainer.style.backgroundPosition = "center"; // 居中显示背景图片
    gameContainer.style.overflow = "hidden"; // 防止内容溢出

    // 将 canvas 添加到游戏容器中
    CONFIG.canvas.style.position = "relative"; // 确保 canvas 相对于容器定位
    gameContainer.appendChild(CONFIG.canvas);

    // 将游戏容器添加到 body
    document.body.appendChild(gameContainer);
}

function gameLoop(timestamp) {
    // // 检查键状态，防止卡住
    // for (const key in CONFIG.keys) {
    //   if (CONFIG.keys[key] && !isKeyCurrentlyPressed(key)) {
    //     CONFIG.keys[key] = false; // 如果键未按下但状态为 true，重置为 false
    //   }
    // }

    //const delta = timestamp - lastFrameTime;
    // if (delta < 1000 / 90) { // 限制到 90 FPS
    //   requestAnimationFrame(gameLoop);
    //   return;
    // }
    lastFrameTime = timestamp;

    if (CONFIG.isPaused) return; // 如果游戏暂停，则不执行游戏循环
    CONFIG.ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height); // 清除画布
    // 绘制背景图片
    // const backgroundImage = new Image();
    // backgroundImage.src = 'image/gamebg.jpg';
    //CONFIG.ctx.drawImage(CONFIG.backgroundImage, 0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    // 绘制动态星空背景
    generateStars();
    drawPlayer(CONFIG.ctx, CONFIG.player); // 绘制玩家飞机
    // CONFIG.backgroundStars.forEach((star, index) => {
    //   CONFIG.ctx.fillStyle = star.color || 'white';
    //   CONFIG.ctx.beginPath();
    //   CONFIG.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    //   CONFIG.ctx.fill();
    //   star.x += star.speedX || 0;
    //   star.y += star.speedY || star.speed;
    //   if (star.life) star.life--;
    //   if (star.life === 0 || star.y > CONFIG.canvas.height) CONFIG.backgroundStars.splice(index, 1);
    //   if (star.y > CONFIG.canvas.height) {
    //     star.y = 0;
    //     star.x = Math.random() * CONFIG.canvas.width;
    //   }
    // });
    CONFIG.backgroundStars.forEach((star, index) => {
        // 动态光效
        const time = (Date.now() % 1000) / 1000; // 时间因子，范围 [0, 1]
        CONFIG.ctx.shadowColor = star.color; // 根据星星的颜色设置光效颜色
        CONFIG.ctx.shadowBlur = 15 + Math.sin(time * Math.PI * 2) * 5; // 动态模糊程度

        // 添加渐变填充
        const gradient = CONFIG.ctx.createRadialGradient(
            star.x,
            star.y,
            0, // 起点（中心）
            star.x,
            star.y,
            star.size * 2 // 终点（半径）
        );
        gradient.addColorStop(0, "white");
        gradient.addColorStop(1, star.color || "blue");

        // 绘制星星
        CONFIG.ctx.fillStyle = gradient;
        CONFIG.ctx.beginPath();
        CONFIG.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        CONFIG.ctx.fill();

        // 更新星星位置
        star.x += star.speedX || 0;
        star.y += star.speedY || star.speed;

        // 如果星星超出屏幕，重置位置
        if (star.y > CONFIG.canvas.height) {
            star.y = 0;
            star.x = Math.random() * CONFIG.canvas.width;
        }

        // 如果星星有生命值，减少生命值
        if (star.life) star.life--;
        if (star.life === 0) CONFIG.backgroundStars.splice(index, 1);
    });

    // 重置光效，避免影响其他绘制
    CONFIG.ctx.shadowColor = "transparent";
    CONFIG.ctx.shadowBlur = 0;

    //if (e.code === 'ShiftLeft' && CONFIG.specialBulletsLeft > 0) {
    //   if (CONFIG.keys['ShiftLeft'] && CONFIG.specialBulletsLeft > 0) { // 如果按下的是 Shift 键，并且还有特殊子弹次数
    //     //if(!CONFIG.keys[e.key]) CONFIG.keys[e.key] = true; // 设置键盘状态为按下
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
    //   }
    //   //else if (e.code === 'Space') {
    //   if (CONFIG.keys['Space']) { // 如果按下的是空格键
    //     // 如果是 Game Over 界面，禁止触发暂停逻辑
    //     if (CONFIG.gameOverOverlay) {
    //     e.preventDefault(); // 禁止默认行为
    //     return;
    //     }

    //     // 如果不是 Game Over 界面，处理暂停逻辑
    //     if (!CONFIG.isPaused) {
    //     pauseGame();
    //     } else {
    //     resumeGame();
    //     }
    // }

    // 玩家移动
    if (CONFIG.keys["a"] && CONFIG.player.x > 0)
        CONFIG.player.x -= CONFIG.player.speed;
    if (
        CONFIG.keys["d"] &&
        CONFIG.player.x < CONFIG.canvas.width - CONFIG.player.width
    )
        CONFIG.player.x += CONFIG.player.speed;
    if (CONFIG.keys["w"] && CONFIG.player.y > 0)
        CONFIG.player.y -= CONFIG.player.speed;
    if (
        CONFIG.keys["s"] &&
        CONFIG.player.y < CONFIG.canvas.height - CONFIG.player.height
    )
        CONFIG.player.y += CONFIG.player.speed;

    // const playerGradient = CONFIG.ctx.createLinearGradient(
    //   CONFIG.player.x,
    //   CONFIG.player.y,
    //   CONFIG.player.x + CONFIG.player.width,
    //   CONFIG.player.y + CONFIG.player.height
    // );
    // playerGradient.addColorStop(0, 'blue');
    // playerGradient.addColorStop(1, 'cyan');
    // CONFIG.ctx.fillStyle = playerGradient;
    // CONFIG.ctx.fillRect(CONFIG.player.x, CONFIG.player.y, CONFIG.player.width, CONFIG.player.height);
    // // 加载玩家图片

    //CONFIG.ctx.drawImage(CONFIG.player.image, CONFIG.player.x, CONFIG.player.y, CONFIG.player.width, CONFIG.player.height);

    // CONFIG.ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height); // 清除画布
    // CONFIG.ctx.drawImage(CONFIG.player.image, CONFIG.player.x, CONFIG.player.y, CONFIG.player.width, CONFIG.player.height);

    // // 更新 & 绘制子弹
    // CONFIG.bullets.forEach((bullet, index) => {
    //   bullet.y -= bullet.speed;
    //   const bulletGradient = CONFIG.ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
    //   bulletGradient.addColorStop(0, 'yellow');
    //   bulletGradient.addColorStop(1, 'orange');
    //   CONFIG.ctx.fillStyle = bulletGradient;
    //   CONFIG.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    // });
    // CONFIG.bullets = CONFIG.bullets.filter(bullet => bullet.y > 0); // 清理离开屏幕的子弹

    // 更新 & 绘制子弹
    CONFIG.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        // 设置光效
        //const randomHue = Math.random() * 360; // 随机颜色的色相
        CONFIG.ctx.shadowColor = bullet.color; // 随机炫彩光效
        CONFIG.ctx.shadowBlur = 20; // 光效模糊程度

        // 绘制子弹主体（白色）
        CONFIG.ctx.fillStyle = "white";
        CONFIG.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // 重置光效，避免影响其他绘制
        CONFIG.ctx.shadowColor = "transparent";
        CONFIG.ctx.shadowBlur = 0;
    });

    // 清理离开屏幕的子弹
    CONFIG.bullets = CONFIG.bullets.filter((bullet) => bullet.y > 0);

    // 更新 & 绘制敌人
    // CONFIG.enemies.forEach((enemy, eIndex) => {
    //   enemy.y += enemy.speed * CONFIG.enemySpeedMultiplier;
    //   CONFIG.ctx.fillStyle = enemy.color;
    //   CONFIG.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    // });
    // CONFIG.enemies = CONFIG.enemies.filter(enemy => enemy.y < CONFIG.canvas.height); // 清理离开屏幕的敌人

    // 更新 & 绘制敌人
    CONFIG.enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed * CONFIG.enemySpeedMultiplier;

        // 设置光效
        CONFIG.ctx.shadowColor = enemy.color; // 根据敌人的 color 设置光效颜色
        CONFIG.ctx.shadowBlur = 50; // 设置光效模糊程度

        // 绘制敌人主体（白色）
        CONFIG.ctx.fillStyle = "white";
        CONFIG.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // 重置光效，避免影响其他绘制
        CONFIG.ctx.shadowColor = "transparent";
        CONFIG.ctx.shadowBlur = 0;
    });

    // 清理离开屏幕的敌人
    CONFIG.enemies = CONFIG.enemies.filter(
        (enemy) => enemy.y < CONFIG.canvas.height
    );

    // 碰撞检测（子弹打中敌人）
    CONFIG.bullets.forEach((bullet, bIndex) => {
        CONFIG.enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                CONFIG.enemies.splice(eIndex, 1);
                if (!bullet.isSpecial) {
                    CONFIG.bullets.splice(bIndex, 1);
                } // 删除子弹
                CONFIG.score += 10;
                CONFIG.explosionSound.currentTime = 0;
                CONFIG.explosionSound.volume = 0.3;
                CONFIG.explosionSound.play();
            }
        });
    });

    // 检测敌人撞到玩家
    CONFIG.enemies.forEach((enemy, eIndex) => {
        if (
            CONFIG.player.x < enemy.x + enemy.width &&
            CONFIG.player.x + CONFIG.player.width > enemy.x &&
            CONFIG.player.y < enemy.y + enemy.height &&
            CONFIG.player.y + CONFIG.player.height > enemy.y
        ) {
            if (CONFIG.life > 0) {
                CONFIG.life--;
                CONFIG.specialBulletsLeft++;

                CONFIG.enemies.splice(eIndex, 1); // 删除敌人
                CONFIG.explosionSound.currentTime = 0;
                CONFIG.explosionSound.play();
            }
            if (CONFIG.life === 0) {
                endGame(); // 游戏结束
            }
        }
    });

    if (
        CONFIG.score > 0 &&
        CONFIG.score % 300 == 0 &&
        CONFIG.score != CONFIG.lastaccelerate_score &&
        CONFIG.enemySpeedMultiplier <= 3
    ) {
        // 每得 100 分加速一次
        CONFIG.enemySpeedMultiplier += 0.07;

        if (CONFIG.enemySpawnInterval >= 60) {
            CONFIG.enemySpawnInterval -= 20;
        } // 最小间隔为 200ms
        CONFIG.lastaccelerate_score = CONFIG.score; // 更新上次加速分数
    }
    if (
        CONFIG.score % 150 == 0 &&
        CONFIG.score > 0 &&
        CONFIG.score != CONFIG.lastrecover_score
    ) {
        if (CONFIG.life < 5) CONFIG.life += 1; // 每 300 分恢复 1 条命
        CONFIG.specialBulletsLeft += 2; // 每 100 分增加 3 发特殊子弹
        CONFIG.lastrecover_score = CONFIG.score; // 更新上次恢复分数
    }

    // 显示分数
    CONFIG.ctx.fillStyle = "white";
    CONFIG.ctx.font = "20px Audiowide";
    CONFIG.ctx.shadowColor = "ff0080";
    CONFIG.ctx.shadowBlur = 100; // 设置光效模糊程度
    CONFIG.ctx.fillText("⭐ SCORE: " + CONFIG.score, 20, 40);
    //CONFIG.ctx.fillText('💖 LIFE: ' + CONFIG.life, 20, 90);
    CONFIG.ctx.fillText("✈️ LIFE: " + "⚡".repeat(CONFIG.life), 20, 90); // 使用心形符号表示生命
    CONFIG.ctx.fillText("☄️ LASER WAVE: " + CONFIG.specialBulletsLeft, 20, 140); // 显示特殊子弹次数

    gameLoopId = requestAnimationFrame(gameLoop);
}

// 暂停游戏
function pauseGame() {
    if (!CONFIG.isGameRunning || CONFIG.pauseOverlay || CONFIG.gameOverOverlay)
        return; // 如果已有暂停或 Game Over 界面，不重复创建

    CONFIG.isPaused = true;
    cancelAnimationFrame(gameLoopId); // 停止游戏循环

    // 创建暂停界面
    CONFIG.pauseOverlay = document.createElement("div");
    CONFIG.pauseOverlay.style.position = "absolute";
    CONFIG.pauseOverlay.style.top = "50%";
    CONFIG.pauseOverlay.style.left = "50%";
    CONFIG.pauseOverlay.style.transform = "translate(-50%, -50%)";
    CONFIG.pauseOverlay.style.textAlign = "center";
    CONFIG.pauseOverlay.style.color = "#fff";
    CONFIG.pauseOverlay.style.fontFamily = "Audiowide, sans-serif";
    CONFIG.pauseOverlay.style.background = "rgba(0, 0, 0, 0.0`)";
    CONFIG.pauseOverlay.style.borderRadius = "15px";
    CONFIG.pauseOverlay.style.padding = "20px";
    CONFIG.pauseOverlay.style.boxShadow = null;

    const pauseText = document.createElement("h1");
    pauseText.textContent = "Press SPACE to Continue";
    pauseText.style.fontSize = "40px";
    pauseText.style.color = "#ffffff";
    pauseText.style.textShadow =
        "0 0 10px #ff0080, 0 0 20px #ff00ff, 0 0 30px #ff0080";
    //pauseText.style.textShadow = '0 0 10pxrgb(0, 225, 255), 0 0 20px #0ff';
    CONFIG.pauseOverlay.appendChild(pauseText);
    if (CONFIG.enemySpawnTimer) {
        clearInterval(CONFIG.enemySpawnTimer); // 停止敌人生成
        CONFIG.enemySpawnTimer = null; // 清除定时器引用
    }
    // 创建 Back 按钮
    const backButton = createBackButton(() => {
        CONFIG.pauseOverlay.remove();
        CONFIG.pauseOverlay = null; // 清除暂停界面引用
        //
        CONFIG.homepageMusicIndex = (CONFIG.homepageMusicIndex + 1) % 3;
        CONFIG.homepageMusic =
            CONFIG.homepageMusicList[CONFIG.homepageMusicIndex]; // 随机选择背景音乐
        CONFIG.homepageMusic.currentTime = 0; // 重置音乐播放时间
        showMainMenu(); // 返回主界面
    });
    CONFIG.pauseOverlay.appendChild(backButton);

    document.body.appendChild(CONFIG.pauseOverlay);
}

// 恢复游戏
function resumeGame() {
    if (!CONFIG.pauseOverlay) return; // 如果暂停界面不存在，则不执行恢复操作

    CONFIG.isPaused = false;
    CONFIG.pauseOverlay.remove(); // 移除暂停界面
    spawnEnemies();
    CONFIG.pauseOverlay = null; // 清除暂停界面引用
    gameLoop(); // 继续游戏循环
}

// 游戏结束界面
function showGameOver() {
    if (CONFIG.gameOverOverlay) return; // 如果游戏结束界面已存在，则不重复创建
    if (CONFIG.enemySpawnTimer) {
        clearInterval(CONFIG.enemySpawnTimer); // 停止敌人生成
        CONFIG.enemySpawnTimer = null; // 清除定时器引用
    }
    cancelAnimationFrame(gameLoopId); // 停止游戏循环
    CONFIG.isPaused = true; // 确保游戏暂停

    // 创建游戏结束界面
    CONFIG.gameOverOverlay = document.createElement("div");
    CONFIG.gameOverOverlay.style.position = "absolute";
    CONFIG.gameOverOverlay.style.top = "50%";
    CONFIG.gameOverOverlay.style.left = "50%";
    CONFIG.gameOverOverlay.style.transform = "translate(-50%, -50%)";
    CONFIG.gameOverOverlay.style.textAlign = "center";
    CONFIG.gameOverOverlay.style.color = "#fff";
    CONFIG.gameOverOverlay.style.fontFamily = "Audiowide, sans-serif";
    CONFIG.gameOverOverlay.style.background = "rgba(0, 0, 0, 0.0)";
    CONFIG.gameOverOverlay.style.borderRadius = "20px";
    CONFIG.gameOverOverlay.style.padding = "40px"; // 增大框的大小
    CONFIG.gameOverOverlay.style.boxShadow = null;

    const gameOverText = document.createElement("h1");
    gameOverText.textContent = "YOU'RE DONE!!";
    gameOverText.style.fontSize = "60px";
    gameOverText.style.color = "#fff";
    gameOverText.style.textShadow = "0 0 20px #ff0080, 0 0 40px #0ff";
    gameOverText.style.marginBottom = "30px";
    CONFIG.gameOverOverlay.appendChild(gameOverText);

    // 创建 Restart 按钮
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.style.marginTop = "20px";
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "20px";
    restartButton.style.fontFamily = "Audiowide, sans-serif";
    restartButton.style.color = "#ff0080";
    restartButton.style.background = "linear-gradient(45deg, #fff, #fff)";
    restartButton.style.border = "2px solid #fff";
    restartButton.style.borderRadius = "10px";
    restartButton.style.boxShadow = "0 0 10px #ff0080, 0 0 20px #0ff";
    restartButton.style.cursor = "pointer";
    restartButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    restartButton.addEventListener("mouseover", () => {
        restartButton.style.transform = "scale(1.1)";
        restartButton.style.boxShadow = "0 0 30px #ff0080, 0 0 50px #0ff";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    restartButton.addEventListener("mouseout", () => {
        restartButton.style.transform = "scale(1)";
        restartButton.style.boxShadow = "0 0 10px #ff0080, 0 0 20px #0ff";
    });
    restartButton.addEventListener("click", () => {
        CONFIG.gameOverOverlay.remove();
        CONFIG.gameOverOverlay = null; // 清除游戏结束界面引用
        CONFIG.isGameRunning = true; // 设置游戏状态为运行
        resetGame(); // 重置游戏
        spawnEnemies(); // 重新生成敌人
        gameLoop(); // 重新开始游戏
    });
    CONFIG.gameOverOverlay.appendChild(restartButton);

    //const backgroundImage_game = new Image();
    //backgroundImage_game.src = 'image/bg2.jpg'; // 替换为你的游戏结束背景图片路径
    // 创建 Back 按钮
    const backButton = createBackButton(() => {
        CONFIG.gameOverOverlay.remove();
        CONFIG.gameOverOverlay = null; // 清除游戏结束界面引用
        const gameContainer = document.getElementById("gameContainer");
        if (gameContainer) {
            gameContainer.remove();
        } // 移除游戏容器
        //
        CONFIG.homepageMusicIndex = (CONFIG.homepageMusicIndex + 1) % 3;
        CONFIG.homepageMusic =
            CONFIG.homepageMusicList[CONFIG.homepageMusicIndex]; // 随机选择背景音乐
        CONFIG.homepageMusic.currentTime = 0; // 重置音乐播放时间
        showMainMenu(); // 返回主界面
    });
    CONFIG.gameOverOverlay.appendChild(backButton);

    document.body.appendChild(CONFIG.gameOverOverlay);
}

// 重置游戏
function resetGame() {
    CONFIG.life = 5; // 重置生命值
    CONFIG.score = 0;
    CONFIG.bullets = [];
    CONFIG.specialBulletsLeft = 10; // 重置特殊子弹次数
    CONFIG.enemies = [];
    CONFIG.backgroundStars = [];
    createStars(); // 重新生成背景星星
    CONFIG.isPaused = false; // 确保游戏不是暂停状态
    // randomIndex = Math.floor(Math.random() * 3); // 生成 0, 1, 2 中的随机数
    CONFIG.bgMusicIndex = (CONFIG.bgMusicIndex + 1) % 3;
    if (CONFIG.bgMusic) {
        CONFIG.bgMusic.pause(); // 暂停当前背景音乐
    }
    CONFIG.bgMusic = CONFIG.bgMusicList[CONFIG.bgMusicIndex]; // 随机选择背景音乐
    if (CONFIG.bgMusicIndex == 0) CONFIG.bgMusic.volume = 0.5;
    else CONFIG.bgMusic.volume = 0.9; // 设置音量
    CONFIG.bgMusic.loop = true; // 循环播放
    CONFIG.bgMusic.currentTime = 0; // 重置背景音乐
    CONFIG.player.x = CONFIG.canvas.width / 2 - 15; // 重置玩家位置
    CONFIG.player.y = CONFIG.canvas.height - 60;
    CONFIG.bgMusic.play(); // 重新播放背景音乐

    // 重置敌人速度和密度
    CONFIG.enemySpeedMultiplier = 1.2; // 重置速度倍率
    CONFIG.enemySpawnInterval =
        CONFIG.difficulty === "easy"
            ? 500
            : CONFIG.difficulty === "medium"
            ? 300
            : 200;
}

// 修改游戏结束逻辑
function endGame() {
    cancelAnimationFrame(gameLoopId); // 确保停止游戏循环
    CONFIG.highScores.push(CONFIG.score);
    CONFIG.highScores.sort((a, b) => b - a);
    CONFIG.highScores = CONFIG.highScores.slice(0, 3);
    localStorage.setItem("highScores", JSON.stringify(CONFIG.highScores));
    CONFIG.isGameRunning = false; // 设置游戏状态为未运行
    showGameOver(); // 显示游戏结束界面
}

// 创建箭头图标的 Back 按钮
function createBackButton(onClick) {
    const backButton = document.createElement("button");
    backButton.innerHTML = "BACK TO MENU"; // 使用箭头符号
    backButton.style.marginTop = "40px"; // 增大与其他按钮的间隔
    backButton.style.padding = "15px 30px";
    backButton.style.fontSize = "20px";
    backButton.style.fontFamily = "Audiowide, sans-serif";
    backButton.style.color = "#fff";
    backButton.style.background = "#ff0080"; // 土黄色底色
    backButton.addEventListener("mouseover", () => {
        backButton.style.transform = "scale(1.1)";
        backButton.style.boxShadow = "0 0 30px #ff0080, 0 0 50px #0ff";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    backButton.addEventListener("mouseout", () => {
        backButton.style.transform = "scale(1)";
        backButton.style.boxShadow = "0 0 20px #ff0080, 0 0 40px #0ff";
    });
    backButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    backButton.style.border = "2px solid #fff";
    backButton.style.borderRadius = "10px";
    backButton.style.boxShadow = "0 0 10pxrgb(240, 252, 0), 0 0 20px #000";
    backButton.style.cursor = "pointer";
    backButton.addEventListener("click", onClick);
    return backButton;
}

function showSettingsMenu() {
    // 创建设置界面容器
    const settingsDiv = document.createElement("div");
    settingsDiv.style.position = "absolute";
    settingsDiv.style.top = "0";
    settingsDiv.style.left = "0";
    settingsDiv.style.width = "100%";
    settingsDiv.style.height = "100%";
    settingsDiv.style.background = "rgba(0, 0, 0, 0.9)";
    settingsDiv.style.display = "flex";
    settingsDiv.style.flexDirection = "column";
    settingsDiv.style.justifyContent = "center";
    settingsDiv.style.alignItems = "center";
    settingsDiv.style.textAlign = "center";
    settingsDiv.style.color = "#fff";
    settingsDiv.style.fontFamily = "Audiowide, sans-serif";
    settingsDiv.style.fontSize = "24px";
    settingsDiv.style.boxShadow = "0 0 20px #0ff, 0 0 40px #ff0080";

    // 创建标题
    const title = document.createElement("h1");
    title.textContent = "Settings";
    title.style.color = "#ffffff";
    title.style.textShadow = "0 0 20px #ff0080, 0 0 40px #0ff";
    title.style.marginBottom = "30px";
    settingsDiv.appendChild(title);

    //   // 作者信息
    // const authorInfo = document.createElement('p');
    // authorInfo.textContent = 'Author: minrb@mail2.sysu.edu.cn';
    // authorInfo.style.fontSize = '30px';
    // authorInfo.style.color = '#ffffff';
    // authorInfo.style.textShadow = '0 0 20px #ff0080, 0 0 40px #0ff';
    // authorInfo.style.fontFamily = 'Audiowide, sans-serif';
    // //authorInfo.style.fontSize = '20px';
    // authorInfo.style.position = 'absolute'; // 设置为绝对定位
    // authorInfo.style.bottom = '20px'; // 距离底部 10px
    // authorInfo.style.left = '50%'; // 水平居中
    // authorInfo.style.transform = 'translateX(-50%)'; // 修正水平居中偏移
    // settingsDiv.appendChild(authorInfo);

    // 创建 Reset High Scores 按钮
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset High Scores";
    resetButton.style.marginTop = "20px";
    resetButton.style.padding = "15px 40px";
    resetButton.style.fontSize = "20px";
    resetButton.style.cursor = "pointer";
    resetButton.style.color = "#ff0080";
    resetButton.style.background = "linear-gradient(45deg, #ffffff, #ffffff)";
    resetButton.style.border = "2px solid #fff";
    resetButton.style.borderRadius = "10px";
    resetButton.style.boxShadow = "0 0 20px #ff0000, 0 0 40px #ff8000";
    resetButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    resetButton.addEventListener("mouseover", () => {
        resetButton.style.transform = "scale(1.1)";
        resetButton.style.boxShadow = "0 0 30px #ff0000, 0 0 50px #ff8000";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    resetButton.style.fontFamily = "Audiowide, sans-serif";
    resetButton.addEventListener("mouseout", () => {
        resetButton.style.transform = "scale(1)";
        resetButton.style.boxShadow = "0 0 20px #ff0000, 0 0 40px #ff8000";
    });
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("highScores"); // 清除 highScores 数据
        CONFIG.highScores = [0, 0, 0]; // 重置 CONFIG 中的 highScores
        alert("High Scores have been reset!");
    });
    settingsDiv.appendChild(resetButton);

    // 创建背景选择下拉菜单
    const backgroundLabel = document.createElement("label");
    backgroundLabel.textContent = "Select Background:";
    backgroundLabel.style.fontFamily = "Audiowide, sans-serif";
    backgroundLabel.style.color = "#ffffff";
    backgroundLabel.style.marginTop = "30px";
    backgroundLabel.style.fontSize = "20px";
    settingsDiv.appendChild(backgroundLabel);

    const backgroundSelect = document.createElement("select");
    backgroundSelect.style.marginTop = "10px";
    backgroundSelect.style.padding = "10px";
    backgroundSelect.style.fontSize = "18px";
    backgroundSelect.style.borderRadius = "5px";
    backgroundSelect.style.border = "2px solid #ff0080";
    backgroundSelect.style.boxShadow = "0 0 10px #0ff, 0 0 20px #ff0080";
    settingsDiv.style.background = `
  linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  url('image/bgi_3.jpg')
`;
    settingsDiv.style.backgroundSize = "cover"; // 确保图片覆盖整个背景
    settingsDiv.style.backgroundPosition = "center"; // 居中显示背景图片
    // 添加背景选项
    const backgrounds = [{ name: "Space", value: "image/bgi_3.jpg" }];
    backgrounds.forEach((bg) => {
        const option = document.createElement("option");
        option.value = bg.value;
        option.textContent = bg.name;
        option.style.fontFamily = "Audiowide, sans-serif";
        option.style.color = "#000";
        option.style.background = "#fff";
        backgroundSelect.appendChild(option);
    });

    // 监听背景选择变化
    backgroundSelect.addEventListener("change", (e) => {
        CONFIG.selectedBackground = e.target.value; // 更新选中的背景
        alert(
            `Background changed to: ${
                e.target.options[e.target.selectedIndex].text
            }`
        );
    });
    settingsDiv.appendChild(backgroundSelect);

    // 创建返回主菜单按钮
    const backButton = document.createElement("button");
    backButton.textContent = "Back to Main Menu";
    backButton.style.marginTop = "30px";
    backButton.style.padding = "15px 40px";
    backButton.style.fontSize = "20px";
    backButton.style.cursor = "pointer";
    backButton.style.color = "#ff0080";
    backButton.style.background = "linear-gradient(45deg, #ffffff, #ffffff)";
    backButton.style.border = "2px solid #fff";
    backButton.style.borderRadius = "10px";
    backButton.style.boxShadow = "0 0 20px #00ff00, 0 0 40px #00bfff";
    backButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    backButton.addEventListener("mouseover", () => {
        backButton.style.transform = "scale(1.1)";
        backButton.style.boxShadow = "0 0 30px #00ff00, 0 0 50px #00bfff";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    backButton.style.fontFamily = "Audiowide, sans-serif";
    backButton.addEventListener("mouseout", () => {
        backButton.style.transform = "scale(1)";
        backButton.style.boxShadow = "0 0 20px #00ff00, 0 0 40px #00bfff";
    });
    // 返回主菜单事件
    backButton.addEventListener("click", () => {
        settingsDiv.remove(); // 移除设置界面
        showMainMenu(); // 返回主菜单
    });
    settingsDiv.appendChild(backButton);

    document.body.appendChild(settingsDiv);
}
function showMainMenu() {
    if (CONFIG.bgMusic) {
        CONFIG.bgMusic.pause(); // 暂停之前的背景音乐
        CONFIG.bgMusic.currentTime = 0; // 重置播放时间
    }
    if (CONFIG.homepageMusic == null) {
        // randomIndex = Math.floor(Math.random() * 3); // 生成 0, 1, 2 中的随机数
        CONFIG.homepageMusicIndex = (CONFIG.homepageMusicIndex + 1) % 3;
        CONFIG.homepageMusic =
            CONFIG.homepageMusicList[CONFIG.homepageMusicIndex]; // 随机选择背景音乐
    }
    CONFIG.isGameRunning = false; // 设置游戏状态为未运行
    CONFIG.homepageMusic.volume = 1; // 设置音量
    CONFIG.homepageMusic.loop = true; // 循环播放
    //CONFIG.homepageMusic.currentTime = 0; // 重置音乐播放时间

    // CONFIG.bgMusic = CONFIG.bgMusicList[randomIndex]; // 随机选择背景音乐
    // CONFIG.bgMusic.volume = 0.8; // 设置音量
    // CONFIG.bgMusic.pause(); // 暂停音乐
    // CONFIG.bgMusic.loop = true; // 循环播放

    CONFIG.homepageMusic.play(); // 播放主页音乐
    const mainMenuDiv = document.createElement("div");
    mainMenuDiv.style.position = "absolute";
    mainMenuDiv.style.top = "0";
    mainMenuDiv.style.left = "0";
    mainMenuDiv.style.width = "100%";
    mainMenuDiv.style.height = "100%";
    mainMenuDiv.style.backgroundImage = "url('image/bgi_3.jpg')"; // 替换为你的背景图片路径
    //mainMenuDiv.style.backgroundImage = `url('https://cdn.jsdelivr.net/gh/UIOSN/Pixel-Aero@main/image/bgi_3.jpg')`; // 使用选中的背景
    mainMenuDiv.style.backgroundSize = "cover";
    mainMenuDiv.style.backgroundPosition = "center";
    mainMenuDiv.style.display = "flex";
    mainMenuDiv.style.flexDirection = "column";
    mainMenuDiv.style.justifyContent = "center";
    mainMenuDiv.style.alignItems = "center";
    mainMenuDiv.style.textAlign = "center";

    // 作者信息
    const authorInfo = document.createElement("p");
    authorInfo.textContent = "Author: minrb@mail2.sysu.edu.cn";
    authorInfo.style.fontSize = "30px";
    authorInfo.style.color = "#ffffff";
    authorInfo.style.textShadow = "0 0 20px #ff0080, 0 0 40px #0ff";
    authorInfo.style.fontFamily = "Audiowide, sans-serif";
    //authorInfo.style.fontSize = '20px';
    authorInfo.style.position = "absolute"; // 设置为绝对定位
    authorInfo.style.bottom = "20px"; // 距离底部 10px
    authorInfo.style.left = "50%"; // 水平居中
    authorInfo.style.transform = "translateX(-50%)"; // 修正水平居中偏移
    mainMenuDiv.appendChild(authorInfo);

    // 创建背景雨丝的 canvas
    const rainCanvas = document.createElement("canvas");
    rainCanvas.style.position = "absolute";
    rainCanvas.style.top = "0";
    rainCanvas.style.left = "0";
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainCanvas.style.pointerEvents = "none"; // 使 canvas 不阻止鼠标事件
    mainMenuDiv.appendChild(rainCanvas);

    // 创建标题
    const title = document.createElement("h1");
    title.textContent = "Pixel Aero";
    title.style.color = "#ffffff"; // 霓虹粉色
    title.style.fontFamily = "Audiowide, sans-serif"; // 更有科技感的字体
    title.style.fontSize = "60px";
    title.style.textShadow = "0 0 20px #ff0080, 0 0 40px #0ff, 0 0 60px #ff0";
    title.style.marginBottom = "50px";
    title.style.animation = "neonShadow 2s infinite"; // 添加动画
    mainMenuDiv.appendChild(title);

    // 添加 CSS 动画到页面
    const style = document.createElement("style");
    style.textContent = `
    @keyframes neonShadow {
      0% {
        text-shadow: 0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 30px #ff00ff, 0 0 40px #ff00ff;
      }
      50% {
        text-shadow: 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #00bfff, 0 0 50px #00bfff;
      }
      100% {
        text-shadow: 0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 30px #ff00ff, 0 0 40px #ff00ff;
      }
    }
  `;
    document.head.appendChild(style);

    // 显示最高分
    // 显示最高分
    const highScoresDiv = document.createElement("div");
    highScoresDiv.style.position = "absolute"; // 设置为绝对定位
    highScoresDiv.style.top = "20px"; // 距离顶部 20px
    highScoresDiv.style.left = "20px"; // 距离左侧 20px
    highScoresDiv.style.color = "#ffffff";
    highScoresDiv.style.fontFamily = "Audiowide, sans-serif";
    highScoresDiv.style.fontSize = "18px"; // 调整字体大小
    highScoresDiv.style.textShadow = "0 0 10px #ff0080, 0 0 20px #0ff";
    //highScoresDiv.style.boxShadow = '0 0 10px #0ff, 0 0 20px #ff0080'; // 霓虹光晕

    const highScoresTitle = document.createElement("h2");
    highScoresTitle.textContent = "🏆 High Scores";
    highScoresTitle.style.marginBottom = "10px";
    highScoresDiv.appendChild(highScoresTitle);

    CONFIG.highScores.forEach((score, index) => {
        const scoreElement = document.createElement("p");
        scoreElement.textContent = `${index + 1}. ${score}`;
        scoreElement.style.margin = "5px 0";
        highScoresDiv.appendChild(scoreElement);
    });

    mainMenuDiv.appendChild(highScoresDiv);
    // 创建 Start 按钮
    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.style.fontFamily = "Audiowide, sans-serif";
    startButton.style.marginTop = "20px";
    startButton.style.padding = "15px 40px";
    startButton.style.fontSize = "30px";
    startButton.style.cursor = "pointer";
    startButton.style.color = "#ff0080";
    startButton.style.background = "linear-gradient(45deg,#ffffff, #ffffff)";
    startButton.style.border = "2px solid #fff";
    startButton.style.borderRadius = "10px";
    startButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    startButton.addEventListener("mouseover", () => {
        startButton.style.transform = "scale(1.1)";
        startButton.style.boxShadow = "0 0 30px #ff0080, 0 0 50px #ff00ff";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    startButton.addEventListener("mouseout", () => {
        startButton.style.boxShadow = null; // 清除阴影
        startButton.style.transform = "scale(1)";
        //startButton.style.boxShadow = '0 0 20pxrgb(255, 0, 217), 0 0 40px #0ff';
    });
    startButton.addEventListener("click", () => {
        mainMenuDiv.remove(); // 移除主菜单
        showDifficultySelection(); // 在主界面上显示难度选择界面
    });

    // 创建 Settings 按钮
    const settingsButton = document.createElement("button");
    settingsButton.textContent = "Settings";
    settingsButton.style.fontFamily = "Audiowide, sans-serif";
    settingsButton.style.marginTop = "20px";
    settingsButton.style.padding = "15px 40px";
    settingsButton.style.fontSize = "20px";
    settingsButton.style.cursor = "pointer";
    settingsButton.style.color = "#ff0080";
    settingsButton.style.background = "linear-gradient(45deg, #fff, #fff)";
    settingsButton.addEventListener("mouseover", () => {
        settingsButton.style.transform = "scale(1.1)";
        settingsButton.style.boxShadow = "0 0 30px #ff0080, 0 0 50px #ff0080";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    settingsButton.addEventListener("mouseout", () => {
        settingsButton.style.transform = "scale(1)";
        settingsButton.style.boxShadow = null; // 清除阴影
    });
    settingsButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    settingsButton.style.border = "2px solid #fff";
    settingsButton.style.margin = "10px";
    settingsButton.style.borderRadius = "10px";

    settingsButton.addEventListener("click", () => {
        mainMenuDiv.remove(); // 移除主菜单
        showSettingsMenu(); // 显示设置界面
    });
    mainMenuDiv.appendChild(settingsButton);
    mainMenuDiv.appendChild(startButton);

    document.body.appendChild(mainMenuDiv);
    //绘制雨丝效果
    const ctx = rainCanvas.getContext("2d");
    const raindrops = [];

    // 初始化雨丝
    for (let i = 0; i < 400; i++) {
        raindrops.push({
            x: Math.random() * rainCanvas.width, // 起始 x 坐标
            y: Math.random() * rainCanvas.height, // 起始 y 坐标
            length: Math.random() * 20 + 10, // 雨丝长度
            speed: Math.random() * 4 + 15, // 雨丝速度
            angle: Math.PI / 3, // 雨丝倾斜角度（45度）
        });
    }

    // 绘制雨丝动画
    function drawRain() {
        ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        ctx.strokeStyle = "rgba(255, 255, 255)";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5; // 设置透明度
        raindrops.forEach((drop) => {
            const xEnd = drop.x - drop.length * Math.cos(drop.angle); // 计算雨丝终点 x 坐标
            const yEnd = drop.y + drop.length * Math.sin(drop.angle); // 计算雨丝终点 y 坐标

            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            // 更新雨丝位置
            drop.x -= drop.speed * Math.cos(drop.angle);
            drop.y += drop.speed * Math.sin(drop.angle);

            // 如果雨丝超出屏幕，重置到顶部
            if (drop.y > rainCanvas.height || drop.x < -drop.length) {
                drop.x = Math.random() * rainCanvas.width;
                drop.y = -drop.length;
            }
        });

        requestAnimationFrame(drawRain); // 循环动画
    }

    drawRain(); // 开始绘制雨丝
}

// function showMainMenu() {
//   // 创建主菜单容器
//   const mainMenuDiv = document.createElement('div');
//   mainMenuDiv.style.position = 'absolute';
//   mainMenuDiv.style.top = '0';
//   mainMenuDiv.style.left = '0';
//   mainMenuDiv.style.width = '100%';
//   mainMenuDiv.style.height = '100%';
//   mainMenuDiv.style.display = 'flex';
//   mainMenuDiv.style.flexDirection = 'column';
//   mainMenuDiv.style.justifyContent = 'center';
//   mainMenuDiv.style.alignItems = 'center';
//   mainMenuDiv.style.textAlign = 'center';

//   // 创建背景雨丝的 canvas
//   const rainCanvas = document.createElement('canvas');
//   rainCanvas.style.position = 'absolute';
//   rainCanvas.style.top = '0';
//   rainCanvas.style.left = '0';
//   rainCanvas.width = window.innerWidth;
//   rainCanvas.height = window.innerHeight;
//   mainMenuDiv.appendChild(rainCanvas);

//   // 创建标题
//   const title = document.createElement('h1');
//   title.textContent = 'Pixel Aero';
//   title.style.color = '#ffffff';
//   title.style.fontFamily = 'Audiowide, sans-serif';
//   title.style.fontSize = '60px';
//   title.style.textShadow = '0 0 20px #ff0080, 0 0 40px #0ff, 0 0 60px #ff0';
//   title.style.marginBottom = '50px';
//   mainMenuDiv.appendChild(title);

//   // 显示最高分
//   const highScoresDiv = document.createElement('div');
//   highScoresDiv.style.position = 'absolute';
//   highScoresDiv.style.top = '20px';
//   highScoresDiv.style.left = '20px';
//   highScoresDiv.style.color = '#ffffff';
//   highScoresDiv.style.fontFamily = 'Audiowide, sans-serif';
//   highScoresDiv.style.fontSize = '18px';
//   highScoresDiv.style.textShadow = '0 0 10px #ff0080, 0 0 20px #0ff';

//   const highScoresTitle = document.createElement('h2');
//   highScoresTitle.textContent = '🏆 High Scores';
//   highScoresTitle.style.marginBottom = '10px';
//   highScoresDiv.appendChild(highScoresTitle);

//   CONFIG.highScores.forEach((score, index) => {
//     const scoreElement = document.createElement('p');
//     scoreElement.textContent = `${index + 1}. ${score}`;
//     scoreElement.style.margin = '5px 0';
//     highScoresDiv.appendChild(scoreElement);
//   });

//   mainMenuDiv.appendChild(highScoresDiv);

//   // 将主菜单添加到页面
//   document.body.appendChild(mainMenuDiv);

//   // 绘制雨丝效果
//   const ctx = rainCanvas.getContext('2d');
//   const raindrops = [];

//   // 初始化雨丝
//   for (let i = 0; i < 150; i++) {
//     raindrops.push({
//       x: Math.random() * rainCanvas.width, // 起始 x 坐标
//       y: Math.random() * rainCanvas.height, // 起始 y 坐标
//       length: Math.random() * 20 + 10, // 雨丝长度
//       speed: Math.random() * 4 + 2, // 雨丝速度
//       angle: Math.PI / 4, // 雨丝倾斜角度（45度）
//     });
//   }

//   // 绘制雨丝动画
//   function drawRain() {
//     ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
//     ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
//     ctx.lineWidth = 1;

//     raindrops.forEach((drop) => {
//       const xEnd = drop.x + drop.length * Math.cos(drop.angle); // 计算雨丝终点 x 坐标
//       const yEnd = drop.y + drop.length * Math.sin(drop.angle); // 计算雨丝终点 y 坐标

//       ctx.beginPath();
//       ctx.moveTo(drop.x, drop.y);
//       ctx.lineTo(xEnd, yEnd);
//       ctx.stroke();

//       // 更新雨丝位置
//       drop.x += drop.speed * Math.cos(drop.angle);
//       drop.y += drop.speed * Math.sin(drop.angle);

//       // 如果雨丝超出屏幕，重置到顶部
//       if (drop.y > rainCanvas.height || drop.x > rainCanvas.width) {
//         drop.x = Math.random() * rainCanvas.width;
//         drop.y = -drop.length;
//       }
//     });

//     requestAnimationFrame(drawRain); // 循环动画
//   }

//   drawRain(); // 开始绘制雨丝

// }
function showDifficultySelection() {
    difficultybackgroundImage = new Image();
    difficultybackgroundImage.src = "image/bgi_3.jpg"; // 替换为你的背景图片路径
    difficultybackgroundImage.onload = () => {
        CONFIG.ctx.drawImage(
            difficultybackgroundImage,
            0,
            0,
            CONFIG.canvas.width,
            CONFIG.canvas.height
        );
    };
    // mainMenuDiv.style.position = 'absolute';
    // mainMenuDiv.style.top = '0';
    // mainMenuDiv.style.left = '0';
    // mainMenuDiv.style.width = '100%';
    // mainMenuDiv.style.height = '100%';
    // mainMenuDiv.style.backgroundImage = "url('image/bgi_3.jpg')"; // 替换为你的背景图片路径
    // mainMenuDiv.style.backgroundSize = 'cover';
    // mainMenuDiv.style.backgroundPosition = 'center';
    // mainMenuDiv.style.display = 'flex';
    // mainMenuDiv.style.flexDirection = 'column';
    // mainMenuDiv.style.justifyContent = 'center';
    // mainMenuDiv.style.alignItems = 'center';
    // mainMenuDiv.style.textAlign = 'center';
    //mainMenuDiv.remove(); // 移除主菜单
    // 创建难度选择界面
    const difficultyDiv = document.createElement("div");
    difficultyDiv.style.position = "absolute";
    difficultyDiv.style.backgroundImage = "url('image/bgi_3.jpg')";
    difficultyDiv.style.backgroundSize = "cover";
    difficultyDiv.style.backgroundPosition = "center";
    difficultyDiv.style.top = "0";
    difficultyDiv.style.left = "0";
    //difficultyDiv.style.transform = 'translate(-50%, -40%)';
    difficultyDiv.style.textAlign = "center";
    difficultyDiv.style.width = "100%";
    difficultyDiv.style.height = "100%";
    difficultyDiv.style.display = "flex";
    difficultyDiv.style.flexDirection = "column";
    difficultyDiv.style.justifyContent = "center";
    difficultyDiv.style.alignItems = "center";
    difficultyDiv.style.color = "#ff0080"; // 霓虹蓝色
    difficultyDiv.style.fontFamily = "Audiowide, sans-serif"; // 未来感字体
    difficultyDiv.style.fontSize = "24px";
    //difficultyDiv.style.background = 'rgba(0, 0, 0, 0.08)';

    // 创建教学说明
    const tutorialDiv = document.createElement("div");
    tutorialDiv.style.position = "absolute";
    tutorialDiv.style.left = "150px"; // 距离右侧 20px
    tutorialDiv.style.top = "50%"; // 垂直居中
    tutorialDiv.style.transform = "translateY(-50%)"; // 修正垂直居中偏移
    tutorialDiv.style.color = "#ffffff";
    tutorialDiv.style.fontFamily = "Audiowide, sans-serif";
    tutorialDiv.style.fontSize = "25px";
    tutorialDiv.style.textAlign = "left"; // 左对齐
    tutorialDiv.style.lineHeight = "1.8"; // 行间距
    tutorialDiv.style.textShadow = "0 0 10px #ff0080, 0 0 20px #0ff"; // 添加霓虹效果

    // 添加教学内容
    tutorialDiv.innerHTML = `
    <h2 style="margin-bottom: 20px; text-shadow: 0 0 20px #ff0080;">How to play?</h2>
    <p>🕹️ <b>WASD</b>: Move</p>
    <p>🖱️ <b>Click</b>: Shoot</p>
    <p>⏸️ <b>Space</b>: Pause</p>
    <p>⚡ <b>Left Shift</b>: Laser Wave</p>
  `;

    // 将教学说明添加到难度选择界面
    difficultyDiv.appendChild(tutorialDiv);

    //difficultyDiv.style.borderRadius = '15px';
    //difficultyDiv.style.padding = '20px';
    //difficultyDiv.style.boxShadow = '0 0 20px #ff0080, 0 0 40px #ff0080'; // 霓虹光晕
    //difficultyDiv.classList.add('neon-border'); // 添加动态霓虹边框的类

    // 创建背景雨丝的 canvas
    const rainCanvas = document.createElement("canvas");
    rainCanvas.style.position = "absolute";
    rainCanvas.style.top = "0";
    rainCanvas.style.left = "0";
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainCanvas.style.pointerEvents = "none"; // 使 canvas 不阻止鼠标事件
    difficultyDiv.appendChild(rainCanvas);

    //绘制雨丝效果
    const ctx = rainCanvas.getContext("2d");
    const raindrops = [];

    // 初始化雨丝
    for (let i = 0; i < 300; i++) {
        raindrops.push({
            x: Math.random() * rainCanvas.width, // 起始 x 坐标
            y: Math.random() * rainCanvas.height, // 起始 y 坐标
            length: Math.random() * 20 + 10, // 雨丝长度
            speed: Math.random() * 4 + 5, // 雨丝速度
            angle: Math.PI / 3, // 雨丝倾斜角度（45度）
        });
    }

    // 绘制雨丝动画
    function drawRain() {
        ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5; // 设置透明度
        raindrops.forEach((drop) => {
            const xEnd = drop.x - drop.length * Math.cos(drop.angle); // 计算雨丝终点 x 坐标
            const yEnd = drop.y + drop.length * Math.sin(drop.angle); // 计算雨丝终点 y 坐标

            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            // 更新雨丝位置
            drop.x -= drop.speed * Math.cos(drop.angle);
            drop.y += drop.speed * Math.sin(drop.angle);

            // 如果雨丝超出屏幕，重置到顶部
            if (drop.y > rainCanvas.height || drop.x > rainCanvas.width) {
                drop.x = Math.random() * rainCanvas.width;
                drop.y = -drop.length;
            }
        });

        requestAnimationFrame(drawRain); // 循环动画
    }

    drawRain(); // 开始绘制雨丝

    // 创建标题
    const title = document.createElement("h1");
    title.textContent = "CHOOSE DIFFICULTY";
    title.style.color = "#ffffff";
    title.style.textShadow =
        "0 0 10px #ff0080, 0 0 20px #ff00ff, 0 0 30px #ff0080";
    title.style.marginTop = "20px";
    difficultyDiv.appendChild(title);

    // 创建难度按钮
    ["Easy", "Medium", "Hard"].forEach((level) => {
        const button = document.createElement("button");
        button.style.fontFamily = "Audiowide, sans-serif";
        button.style.marginTop = "15px";
        button.textContent = level;
        button.style.margin = "10px";
        button.style.padding = "15px 30px";
        button.style.fontSize = "20px";
        button.style.cursor = "pointer";
        button.style.color = "#ff0080";
        button.style.background =
            "linear-gradient(0deg, #ffffff, #ffffff, #ffffff)";
        button.style.border = "2px solid #fff";
        button.style.borderRadius = "10px";
        button.style.boxShadow = "0 0 10pxrgb(255, 251, 0), 0 0 20px #0ff";
        button.style.transition = "transform 0.2s, box-shadow 0.2s";
        button.addEventListener("mouseover", () => {
            button.style.transform = "scale(1.1)";
            button.style.boxShadow = "0 0 20px #ff0080, 0 0 40px #0ff";
        });
        button.addEventListener("mouseout", () => {
            button.style.transform = "scale(1)";
            button.style.boxShadow = "0 0 10px #ff0080, 0 0 20px #0ff";
        });
        button.addEventListener("click", () => {
            CONFIG.difficulty = level.toLowerCase();
            CONFIG.enemySpawnInterval =
                CONFIG.difficulty === "easy"
                    ? 500
                    : CONFIG.difficulty === "medium"
                    ? 300
                    : 200;
            difficultyDiv.remove();
            //CONFIG.enemySpeedMultiplier = CONFIG.difficulty === 'easy' ? 1 : CONFIG.difficulty === 'medium' ? 1.2 : 2;
            CONFIG.homepageMusic.pause(); // 暂停主页音乐
            CONFIG.homepageMusic.currentTime = 0; // 重置主页音乐

            //CONFIG.bgMusic.play();

            //CONFIG.isPaused = false;
            CONFIG.isGameRunning = true; // 设置游戏状态为运行
            resetGame();
            spawnEnemies();
            setupGameContainer(); // 创建游戏容器
            gameLoop();
        });
        difficultyDiv.appendChild(button);
    });

    // 创建 Back 按钮
    const backButton = document.createElement("button");
    backButton.style.fontFamily = "Audiowide, sans-serif";
    backButton.textContent = "Back";
    backButton.style.marginTop = "20px";
    backButton.style.padding = "10px 20px";
    backButton.style.fontSize = "18px";
    backButton.style.cursor = "pointer";
    backButton.style.color = "#ff0080";
    backButton.style.background = "linear-gradient(45deg, #ffffff, #ffffff)";
    backButton.style.border = "2px solid #fff";
    backButton.style.borderRadius = "10px";
    backButton.style.boxShadow = "0 0 10px #ff0, 0 0 20px #ff0080";
    backButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    backButton.addEventListener("mouseover", () => {
        backButton.style.transform = "scale(1.1)";
        backButton.style.boxShadow = "0 0 20px #ff0, 0 0 40px #ff0080";
        document.body.style.cursor = "url('image/custom-cursor.png'), auto";
    });
    backButton.addEventListener("mouseout", () => {
        backButton.style.transform = "scale(1)";
        backButton.style.boxShadow = "0 0 10px #ff0, 0 0 20px #ff0080";
    });
    backButton.addEventListener("click", () => {
        difficultyDiv.remove(); // 移除难度选择界面
        showMainMenu(); // 返回主菜单
    });
    difficultyDiv.appendChild(backButton);
    document.body.appendChild(difficultyDiv);
}
function showStartScreen() {
    // 创建开始界面容器
    if (CONFIG.bgMusic) CONFIG.bgMusic.pause(); // 暂停背景音乐

    const startScreenDiv = document.createElement("div");
    startScreenDiv.style.position = "absolute";
    startScreenDiv.style.top = "0";
    startScreenDiv.style.left = "0";
    startScreenDiv.style.width = "100%";
    startScreenDiv.style.height = "100%";
    startScreenDiv.style.backgroundImage = "url('image/bgi_3.jpg')"; // 替换为你的背景图片路径
    startScreenDiv.style.backgroundSize = "cover";
    startScreenDiv.style.backgroundPosition = "center";
    startScreenDiv.style.display = "flex";
    startScreenDiv.style.flexDirection = "column";
    startScreenDiv.style.justifyContent = "center";
    startScreenDiv.style.alignItems = "center";
    startScreenDiv.style.textAlign = "center";

    // 创建标题
    const title = document.createElement("h1");
    title.textContent = "Pixel Aero";
    title.style.color = "#ffffff";
    title.style.fontFamily = "Audiowide, sans-serif";
    title.style.fontSize = "60px";
    title.style.textShadow = "0 0 20px #ff0080, 0 0 40px #0ff, 0 0 60px #ff0";
    title.style.marginBottom = "30px";
    startScreenDiv.appendChild(title);

    // 创建提示文本
    const promptText = document.createElement("p");
    promptText.textContent = "Press Any Key to Start";
    promptText.style.color = "#ffffff";
    promptText.style.fontFamily = "Audiowide, sans-serif";
    promptText.style.fontSize = "24px";
    promptText.style.textShadow = "0 0 10px #ff0080, 0 0 20px #0ff";
    promptText.style.animation = "blink 1s infinite"; // 添加动画
    startScreenDiv.appendChild(promptText);

    // 将开始界面添加到页面
    document.body.appendChild(startScreenDiv);

    // 添加 CSS 动画到页面
    const style = document.createElement("style");
    style.textContent = `
    @keyframes blink {
      0%, 100% { opacity: 1; } /* 完全显示 */
      50% { opacity: 0; }      /* 完全隐藏 */
    }
  `;
    document.head.appendChild(style);

    // 监听按键事件
    function handleKeyPress() {
        startScreenDiv.remove(); // 移除开始界面
        document.removeEventListener("keydown", handleKeyPress); // 移除事件监听
        document.removeEventListener("click", handleKeyPress); // 移除事件监听
        showMainMenu(); // 显示主菜单
    }

    document.addEventListener("keydown", handleKeyPress);
    // 监听鼠标点击事件
    document.addEventListener("click", handleKeyPress); // 点击任意位置开始游戏
}
function drawPlayer(ctx, player) {
    ctx.drawImage(
        player.image,
        player.x,
        player.y,
        player.width,
        player.height
    );
    // 绘制半透明矩形覆盖在飞机上
}
