const suits = ['♠', '♥', '♦', '♣'];
const ranks = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'J', 'Q', 'K', 'A'
];

let deck = [];
let hand = [];
let selectedIndices = new Set();

const cardsDiv = document.getElementById('cards');
const dealBtn = document.getElementById('deal-btn');
const drawBtn = document.getElementById('draw-btn');
const resultDiv = document.getElementById('result');

function createDeck() {
  deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({suit, rank});
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealHand() {
  hand = [];
  selectedIndices.clear();
  for (let i=0; i<5; i++) {
    hand.push(deck.pop());
  }
}

function renderHand() {
  cardsDiv.innerHTML = '';
  hand.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    if (selectedIndices.has(idx)) cardEl.classList.add('selected');
    if (card.suit === '♥' || card.suit === '♦') cardEl.classList.add('red');
    cardEl.innerHTML = `
      <div class="top-left">${card.rank}${card.suit}</div>
      <div class="bottom-right">${card.rank}${card.suit}</div>
    `;
    cardEl.addEventListener('click', () => {
      if (!drawBtn.disabled) {
        if (selectedIndices.has(idx)) {
          selectedIndices.delete(idx);
        } else {
          selectedIndices.add(idx);
        }
        renderHand();
      }
    });
    cardsDiv.appendChild(cardEl);
  });
}

function replaceSelectedCards() {
  for (const idx of selectedIndices) {
    if (deck.length > 0) {
      hand[idx] = deck.pop();
    }
  }
  selectedIndices.clear();
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
  const vals = cards.map(c => getRankValue(c.rank)).sort((a,b) => a-b);
  for(let i=1; i<vals.length; i++) {
    if (vals[i] !== vals[i-1] +1) return false;
  }
  // A-2-3-4-5もストレート扱い（低いストレート）
  if (vals.toString() === '2,3,4,5,14') return true;
  return true;
}

function countRanks(cards) {
  const counts = {};
  for (const c of cards) {
    counts[c.rank] = (counts[c.rank] || 0) + 1;
  }
  return counts;
}

function getHandRank(cards) {
  cards = [...cards];
  cards.sort((a,b) => getRankValue(b.rank) - getRankValue(a.rank));

  const flush = isFlush(cards);
  const straight = isStraight(cards);
  const counts = Object.values(countRanks(cards)).sort((a,b) => b - a);

  if (straight && flush && getRankValue(cards[0].rank) === 14) return 'ロイヤルフラッシュ';
  if (straight && flush) return 'ストレートフラッシュ';
  if (counts[0] === 4) return 'フォーカード';
  if (counts[0] === 3 && counts[1] === 2) return 'フルハウス';
  if (flush) return 'フラッシュ';
  if (straight) return 'ストレート';
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
  resultDiv.classList.add('hidden');
  resultDiv.textContent = '';
});

drawBtn.addEventListener('click', () => {
  replaceSelectedCards();
  renderHand();
  drawBtn.disabled = true;
  dealBtn.disabled = false;

  // 役判定して表示
  const rank = getHandRank(hand);
  resultDiv.textContent = `役: ${rank}`;
  resultDiv.classList.remove('hidden');
});
