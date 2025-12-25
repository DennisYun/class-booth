const gameNameEls = document.querySelectorAll('.game_name');
const rankEls = document.querySelectorAll('.rank');

let rankingData = null;
let currentGame = 'shooting';

async function fetchRanking() {
  const res = await fetch('/giveranking');
  const json = await res.json();
  if (json.success) {
    rankingData = json.ranking;
    render();
  }
}

async function justfetchRanking() {
  const res = await fetch('/giveranking');
  const json = await res.json();
  if (json.success) {
    rankingData = json.ranking;
  }
}

async function render() {
  if (!rankingData) return;

  const list = rankingData[currentGame] || [];
  const gameTitle = currentGame === 'shooting' ? '사격 게임' : '콩 옮기기 게임';

  const exitDelay = 50;
  const exitDuration = 300;
  const enterDelay = 150;

  /* 1️⃣ 게임 이름 제일 먼저 퇴장 */
  gameNameEls.forEach((el) => el.classList.remove('show'));

  /* 2️⃣ 랭킹들 순서대로 퇴장 */
  rankEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.remove('show');
    }, i * exitDelay);
  });

  const totalExitTime = rankEls.length * exitDelay + exitDuration;

  await justfetchRanking();

  /* 3️⃣ 전부 빠진 뒤 내용 교체 */
  setTimeout(() => {
    // 게임 이름 변경
    gameNameEls.forEach((el) => {
      el.textContent = gameTitle;
    });

    // 랭킹 내용 변경
    rankEls.forEach((el, i) => {
      const data = list[i];
      if (!data) {
        el.querySelector('.rank_label').textContent = `#${i + 1}위`;
        el.querySelector('.rank_name').textContent = '';
        el.querySelector('.rank_score').textContent = '';
      } else {
        el.querySelector('.rank_label').textContent = `#${i + 1}위`;
        el.querySelector('.rank_name').textContent = data.name;

        if (currentGame === 'shooting') {
          el.querySelector(
            '.rank_score'
          ).textContent = `${data.count}개 / ${data.time}초`;
        } else {
          el.querySelector('.rank_score').textContent = `${data.time}초`;
        }
      }
    });

    /* 4️⃣ 게임 이름 제일 먼저 등장 */
    requestAnimationFrame(() => {
      gameNameEls.forEach((el) => el.classList.add('show'));

      /* 5️⃣ 랭킹 순서대로 등장 */
      rankEls.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('show');
        }, i * enterDelay);
      });
    });
  }, totalExitTime);
}

// 10초마다 게임 전환
setInterval(() => {
  currentGame = currentGame === 'shooting' ? 'bean' : 'shooting';
  render();
}, 10000);

fetchRanking();
