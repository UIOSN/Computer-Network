document.addEventListener("DOMContentLoaded", () => {
    console.log("游戏大厅已加载");

    const recentlyPlayed = localStorage.getItem("recentGame");
    if (recentlyPlayed) {
        console.log("上次游玩:", recentlyPlayed);
    }

    const gameCards = document.querySelectorAll(".game-card:not(.disabled)");

    gameCards.forEach((card) => {
        card.addEventListener("click", function (e) {
            const gameName = this.querySelector("h2").textContent;
            localStorage.setItem("recentGame", gameName);
            console.log("进入游戏:", gameName);
        });
    });
});
