// Interactive JS for Carioca Score Landing Page

document.addEventListener('DOMContentLoaded', () => {
  initRoundsGuide();
  initScoreCalculator();
});

// 1. Rounds Guide Data & Logic
const ROUNDS_DATA = {
  1: {
    title: 'Ronda 1: 2 Tríos',
    cards: '6 cartas requeridas',
    desc: 'Debes formar dos tríos (tres cartas del mismo valor, sin importar la pinta). Por ejemplo: tres 8 y tres Q.',
    visuals: [
      { value: '8', suit: '♦', color: 'red' },
      { value: '8', suit: '♥', color: 'red' },
      { value: '8', suit: '♠', color: 'black' },
      { value: 'Q', suit: '♣', color: 'black' },
      { value: 'Q', suit: '♥', color: 'red' },
      { value: 'Q', suit: '♦', color: 'red' }
    ]
  },
  2: {
    title: 'Ronda 2: 1 Trío y 1 Escala',
    cards: '7 cartas requeridas',
    desc: 'Debes formar un trío (tres del mismo valor) y una escala (cuatro cartas consecutivas de la misma pinta). Por ejemplo: tres 5 y la escala 7-8-9-10 de corazones.',
    visuals: [
      { value: '5', suit: '♠', color: 'black' },
      { value: '5', suit: '♣', color: 'black' },
      { value: '5', suit: '♦', color: 'red' },
      { value: '7', suit: '♥', color: 'red' },
      { value: '8', suit: '♥', color: 'red' },
      { value: '9', suit: '♥', color: 'red' },
      { value: '10', suit: '♥', color: 'red' }
    ]
  },
  3: {
    title: 'Ronda 3: 2 Escalas',
    cards: '8 cartas requeridas',
    desc: 'Debes formar dos escalas (dos grupos de cuatro cartas consecutivas de la misma pinta). Por ejemplo: 3-4-5-6 de tréboles y J-Q-K-A de diamantes.',
    visuals: [
      { value: '3', suit: '♣', color: 'black' },
      { value: '4', suit: '♣', color: 'black' },
      { value: '5', suit: '♣', color: 'black' },
      { value: '6', suit: '♣', color: 'black' },
      { value: 'J', suit: '♦', color: 'red' },
      { value: 'Q', suit: '♦', color: 'red' },
      { value: 'K', suit: '♦', color: 'red' },
      { value: 'A', suit: '♦', color: 'red' }
    ]
  },
  4: {
    title: 'Ronda 4: 3 Tríos',
    cards: '9 cartas requeridas',
    desc: 'Debes formar tres tríos (tres grupos de tres cartas del mismo valor). Por ejemplo: tres 2, tres 7 y tres K.',
    visuals: [
      { value: '2', suit: '♣', color: 'black' },
      { value: '2', suit: '♥', color: 'red' },
      { value: '2', suit: '♦', color: 'red' },
      { value: '7', suit: '♠', color: 'black' },
      { value: '7', suit: '♣', color: 'black' },
      { value: '7', suit: '♥', color: 'red' },
      { value: 'K', suit: '♦', color: 'red' },
      { value: 'K', suit: '♠', color: 'black' },
      { value: 'K', suit: '♣', color: 'black' }
    ]
  },
  5: {
    title: 'Ronda 5: 2 Tríos y 1 Escala',
    cards: '10 cartas requeridas',
    desc: 'Debes formar dos tríos y una escala. Requiere juntar 10 cartas combinando tres del mismo valor, otras tres del mismo valor y cuatro en secuencia.',
    visuals: [
      { value: '9', suit: '♥', color: 'red' },
      { value: '9', suit: '♦', color: 'red' },
      { value: '9', suit: '♣', color: 'black' },
      { value: 'A', suit: '♠', color: 'black' },
      { value: 'A', suit: '♣', color: 'black' },
      { value: 'A', suit: '♥', color: 'red' },
      { value: '4', suit: '♦', color: 'red' },
      { value: '5', suit: '♦', color: 'red' },
      { value: '6', suit: '♦', color: 'red' },
      { value: '7', suit: '♦', color: 'red' }
    ]
  },
  6: {
    title: 'Ronda 6: 1 Trío y 2 Escalas',
    cards: '11 cartas requeridas',
    desc: 'Debes formar un trío y dos escalas. Un total de 11 cartas que requiere planificar bien tus combinaciones en la mano.',
    visuals: [
      { value: '6', suit: '♠', color: 'black' },
      { value: '6', suit: '♣', color: 'black' },
      { value: '6', suit: '♥', color: 'red' },
      { value: '2', suit: '♥', color: 'red' },
      { value: '3', suit: '♥', color: 'red' },
      { value: '4', suit: '♥', color: 'red' },
      { value: '5', suit: '♥', color: 'red' },
      { value: '9', suit: '♣', color: 'black' },
      { value: '10', suit: '♣', color: 'black' },
      { value: 'J', suit: '♣', color: 'black' },
      { value: 'Q', suit: '♣', color: 'black' }
    ]
  },
  7: {
    title: 'Ronda 7: 3 Escalas',
    cards: '12 cartas requeridas',
    desc: 'Debes formar tres escalas de cuatro cartas cada una. Una de las rondas más difíciles, requiere acumular 12 cartas en secuencia.',
    visuals: [
      { value: '5', suit: '♦', color: 'red' },
      { value: '6', suit: '♦', color: 'red' },
      { value: '7', suit: '♦', color: 'red' },
      { value: '8', suit: '♦', color: 'red' },
      { value: '8', suit: '♠', color: 'black' },
      { value: '9', suit: '♠', color: 'black' },
      { value: '10', suit: '♠', color: 'black' },
      { value: 'J', suit: '♠', color: 'black' },
      { value: 'A', suit: '♥', color: 'red' },
      { value: '2', suit: '♥', color: 'red' },
      { value: '3', suit: '♥', color: 'red' },
      { value: '4', suit: '♥', color: 'red' }
    ]
  },
  8: {
    title: 'Ronda 8: 4 Tríos',
    cards: '12 cartas requeridas',
    desc: 'Debes formar cuatro tríos. Requiere tener en tu mano cuatro grupos de tres cartas idénticas en número.',
    visuals: [
      { value: '3', suit: '♣', color: 'black' },
      { value: '3', suit: '♦', color: 'red' },
      { value: '3', suit: '♥', color: 'red' },
      { value: '8', suit: '♠', color: 'black' },
      { value: '8', suit: '♣', color: 'black' },
      { value: '8', suit: '♥', color: 'red' },
      { value: '10', suit: '♦', color: 'red' },
      { value: '10', suit: '♠', color: 'black' },
      { value: '10', suit: '♣', color: 'black' },
      { value: 'Q', suit: '♥', color: 'red' },
      { value: 'Q', suit: '♦', color: 'red' },
      { value: 'Q', suit: '♠', color: 'black' }
    ]
  },
  9: {
    title: 'Ronda 9: Escala Sucia',
    cards: '13 cartas requeridas',
    desc: 'Debes formar una sola escala gigante de 13 cartas consecutivas (del As al K) de cualquier pinta mezclada. No se permiten comodines.',
    visuals: [
      { value: 'A', suit: '♣', color: 'black' },
      { value: '2', suit: '♦', color: 'red' },
      { value: '3', suit: '♥', color: 'red' },
      { value: '4', suit: '♠', color: 'black' },
      { value: '5', suit: '♦', color: 'red' },
      { value: '6', suit: '♥', color: 'red' },
      { value: '7', suit: '♣', color: 'black' },
      { value: '8', suit: '♠', color: 'black' },
      { value: '9', suit: '♣', color: 'black' },
      { value: '10', suit: '♦', color: 'red' },
      { value: 'J', suit: '♥', color: 'red' },
      { value: 'Q', suit: '♠', color: 'black' },
      { value: 'K', suit: '♦', color: 'red' }
    ]
  },
  10: {
    title: 'Ronda 10: Escala Real o Pintada',
    cards: '13 cartas requeridas',
    desc: 'La ronda final. Debes hacer una escala completa de 13 cartas (del As al K) pero TODAS deben ser de la misma pinta exacta (ej: diamantes). Tampoco se permiten comodines.',
    visuals: [
      { value: 'A', suit: '♦', color: 'red' },
      { value: '2', suit: '♦', color: 'red' },
      { value: '3', suit: '♦', color: 'red' },
      { value: '4', suit: '♦', color: 'red' },
      { value: '5', suit: '♦', color: 'red' },
      { value: '6', suit: '♦', color: 'red' },
      { value: '7', suit: '♦', color: 'red' },
      { value: '8', suit: '♦', color: 'red' },
      { value: '9', suit: '♦', color: 'red' },
      { value: '10', suit: '♦', color: 'red' },
      { value: 'J', suit: '♦', color: 'red' },
      { value: 'Q', suit: '♦', color: 'red' },
      { value: 'K', suit: '♦', color: 'red' }
    ]
  }
};

function initRoundsGuide() {
  const buttons = document.querySelectorAll('.round-btn');
  const titleEl = document.getElementById('display-round-title');
  const cardsEl = document.getElementById('display-round-cards');
  const descEl = document.getElementById('display-round-desc');
  const visualsEl = document.getElementById('display-round-visuals');

  function renderRound(roundId) {
    const data = ROUNDS_DATA[roundId];
    if (!data) return;

    titleEl.textContent = data.title;
    cardsEl.textContent = data.cards;
    descEl.textContent = data.desc;

    // Render cards visual structure
    visualsEl.innerHTML = '';
    
    // Limits visible cards on mobile so it doesn't overflow, showing first 6-8
    const maxVisible = window.innerWidth < 600 ? 6 : data.visuals.length;
    
    data.visuals.slice(0, maxVisible).forEach(c => {
      const cardDiv = document.createElement('div');
      cardDiv.className = `visual-card-item ${c.color === 'red' ? 'danger-text' : ''}`;
      
      const valSpan = document.createElement('span');
      valSpan.textContent = c.value;
      
      const suitSpan = document.createElement('span');
      suitSpan.textContent = c.suit;
      suitSpan.style.fontSize = '14px';
      suitSpan.style.marginLeft = '2px';
      
      cardDiv.appendChild(valSpan);
      cardDiv.appendChild(suitSpan);
      visualsEl.appendChild(cardDiv);
    });

    if (data.visuals.length > maxVisible) {
      const moreDiv = document.createElement('div');
      moreDiv.className = 'visual-card-item';
      moreDiv.style.background = 'rgba(255,255,255,0.05)';
      moreDiv.style.border = '1px dashed rgba(255,255,255,0.2)';
      moreDiv.style.color = '#fff';
      moreDiv.style.fontSize = '16px';
      moreDiv.textContent = `+${data.visuals.length - maxVisible}`;
      visualsEl.appendChild(moreDiv);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const roundId = btn.getAttribute('data-round');
      renderRound(roundId);
    });
  });

  // Render initial round
  renderRound(1);
}

// 2. Score Calculator Logic
let selectedCards = [];

function initScoreCalculator() {
  const selectBtns = document.querySelectorAll('.card-select-btn');
  const totalPointsEl = document.getElementById('calc-total-points');
  const summaryListEl = document.getElementById('selected-cards-list');
  const clearBtn = document.getElementById('btn-clear-calc');

  function updateCalculator() {
    let total = 0;
    selectedCards.forEach(c => total += c.points);
    
    // Update total points display
    totalPointsEl.textContent = total;

    // Render list
    summaryListEl.innerHTML = '';
    
    if (selectedCards.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-list-msg';
      emptyLi.textContent = 'No has seleccionado ninguna carta aún.';
      summaryListEl.appendChild(emptyLi);
      return;
    }

    selectedCards.forEach((c, idx) => {
      const li = document.createElement('li');
      li.className = 'selected-card-row';
      
      const labelSpan = document.createElement('span');
      labelSpan.textContent = c.label;
      labelSpan.style.fontWeight = '600';
      
      const rightDiv = document.createElement('div');
      
      const ptsSpan = document.createElement('span');
      ptsSpan.textContent = `+${c.points} pts`;
      ptsSpan.style.color = 'var(--accent-gold-light)';
      
      const removeBtn = document.createElement('span');
      removeBtn.innerHTML = ' <i class="fa-solid fa-trash-can"></i>';
      removeBtn.className = 'selected-card-remove';
      removeBtn.addEventListener('click', () => {
        removeCardAt(idx);
      });

      rightDiv.appendChild(ptsSpan);
      rightDiv.appendChild(removeBtn);
      
      li.appendChild(labelSpan);
      li.appendChild(rightDiv);
      summaryListEl.appendChild(li);
    });
  }

  function addCard(label, points) {
    selectedCards.push({ label, points });
    updateCalculator();
  }

  function removeCardAt(index) {
    selectedCards.splice(index, 1);
    updateCalculator();
  }

  selectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.querySelector('.card-label').textContent;
      const points = parseInt(btn.getAttribute('data-points'), 10);
      addCard(label, points);
    });
  });

  clearBtn.addEventListener('click', () => {
    selectedCards = [];
    updateCalculator();
  });
}
