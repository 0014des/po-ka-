const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = []; 
let hand = []; 
let holdIndices = new Set();
let selectedIndices = new Set();

const cardsDiv = document.getElementById('cards');
const dealBtn = document.getElementById('deal-btn');
const drawBtn = document.getElementById('draw-btn');
const resultEl = document.getElementById('result');

function createDeck() {
  deck = []; 
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({suit, rank}); 
    }
  }
}

function shuffleDeck(){
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1)); 
    [deck[i], deck[j]] = [deck[j], deck[i]]; 
  }
}

function dealHand(){
  hand = []; 
  holdIndices.clear();
  selectedIndices.clear();

  for (let i = 0; i < 5; i++) {
    hand.push(deck.pop()); 
  }
}

function renderHand(){
  cardsDiv.innerHTML = '';
  
  hand.forEach((card, idx) => {
    const cardEl = document.createElement('div'); 
    cardEl.classList.add('card'); 
    if (holdIndices.has(idx)) cardEl.classList.add('hold'); 
    if (selectedIndices.has(idx)) cardEl.classList.add('selected'); 
    if (card.suit === '♥' ||
        card.suit === '♦') cardEl.classList.add('red'); 
 
    cardEl.innerHTML = `
      <div class="top-left">${card.rank}${card.suit}</div>
      <div class="bottom-right">${card.rank}${card.suit}</div>
    `;
    cardEl.addEventListener('click', () => {
      if (drawBtn.disabled) return;

      if (holdIndices.has(idx)) {
        holdIndices.delete(idx);
      } else {
        holdIndices.add(idx);
      }
      renderHand();
    });

    cardsDiv.appendChild(cardEl);
  });
}

function replaceHand(){
  for (let idx = 0; idx < hand.length; idx++) {
    if (!holdIndices.has(idx) && deck.length > 0) {
      hand[idx] = deck.pop();
    }
  }
}

function getRankValue(rank) {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank);
}

function isFlush(cards) {
  const suit = cards[0].suit;
  return cards.every(card => card.suit === suit);
}

function isStraight(cards) {
  const values = cards.map(getRankValue).sort((a, b) => a - b);
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== 1) return false;
  }
  
  // A-2-3-4-5もストレート
  if (JSON.stringify(values) === '[2,3,4,5,14]') return true;

  return true;
}

function countRanks(cards) {
  const counts = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return Object.values(counts).sort((a, b) => b - a);
}

function getHandRank(cards) {
  cards = [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));

  const isFl = isFlush(cards);
  const isStr = isStraight(cards);
  const counts = countRanks(cards);

  if (isFl && isStr && getRankValue(cards[0].rank) === 14) return 'ロイヤルフラッシュ';
  if (isFl && isStr) return 'ストレートフラッシュ';
  if (counts[0] === 4) return 'フォーカード';
  if (counts[0] === 3 && counts[1] === 2) return 'フルハウス';
  if (isFl) return 'フラッシュ';
  if (isStr) return 'ストレート';
  if (counts[0] === 3) return 'スリーカード';
  if (counts[0] === 2 && counts[1] === 2) return 'ツーペア';
  if (counts[0] === 2) return 'ワンペア';
  return 'ハイカード';
}

dealBtn.addEventListener('click', () => {
  createDeck();
  shuffleDeck();
  dealHand();
  renderHand();
  dealBtn.disabled = true;
  drawBtn.disabled = false;
  resultEl.classList.add('hidden'); 
});

// 交换して結果も判定
drawBtn.addEventListener('click', () => {
  replaceHand();
  renderHand();

  drawBtn.disabled = true;
  dealBtn.disabled = false;

  const rank = getHandRank(hand);
  resultEl.textContent = `あなたの役: ${rank}`;
  resultEl.classList.remove('hidden'); 
});
