const nCards = 8;
let cards = []; // Será preenchido em createAndInitCards()
const attemptsSpan = document.getElementById('attempts');
const board = document.getElementById("board")

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let attempts = 0;
let matchedPairs = 0;

// --- FUNÇÕES BÁSICAS ---

function createCard(value) {
  const memoryCard = document.createElement("div");
  memoryCard.classList.add("memory-card");
  memoryCard.dataset.cardValue = value;
  // ... (restante do código de criação de elemento)...
  const frontFace = document.createElement("div");
  frontFace.classList.add("front-face");
  const backFace = document.createElement("div");
  backFace.classList.add("back-face");
  const frontParagraph = document.createElement("p");
  const backParagraph = document.createElement("p");
  frontParagraph.textContent = value;
  backParagraph.textContent = "?";
  frontFace.appendChild(frontParagraph);
  backFace.appendChild(backParagraph);
  memoryCard.appendChild(frontFace);
  memoryCard.appendChild(backFace);
  return (memoryCard);
}

// 🐛 CORREÇÃO CRÍTICA: Lógica de criação de cartas movida para uma função
function createAndInitCards() {
    // Limpa o tabuleiro e o array de cartas para garantir um novo começo
    board.innerHTML = '';
    cards = []; 

    for (let i = 0; i < nCards; i++) {
        const newCard1 = createCard(i);
        const newCard2 = createCard(i);
        board.appendChild(newCard1);
        board.appendChild(newCard2);
        cards.push(newCard1);
        cards.push(newCard2);
    }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    saveGameStatus(); // Salva o estado após a primeira carta virada
    return;
  }

  secondCard = this;
  hasFlippedCard = false;

  checkForMatch();
}

function checkForMatch() {
  attempts++;
  attemptsSpan.textContent = attempts;

  let isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;

  isMatch ? disableCards() : unflipCards();
  
  if (matchedPairs !== nCards) {
      saveGameStatus();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  firstCard.classList.add('matched');
  secondCard.classList.add('matched');

  matchedPairs++;
  
  if (matchedPairs === nCards) {
    setTimeout(endGame, 1000);
  }

  resetBoard();
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
    saveGameStatus();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}


// --- PERSISTÊNCIA DE JOGO (LocalStorage) ---

function saveGameStatus() {
  // Salva o ID da primeira carta (se houver) para restaurar firstCard
  let firstCardValue = firstCard ? firstCard.dataset.cardValue : null;
  let firstCardOrder = firstCard ? firstCard.style.order : null;

  const gameState = {
    // Captura o estado essencial de cada carta
    cardsState: cards.map(card => ({
      value: card.dataset.cardValue,
      order: card.style.order,
      isFlipped: card.classList.contains('flip'),
      isMatched: card.classList.contains('matched')
    })),
    attempts: attempts,
    matchedPairs: matchedPairs,
    // 💡 Melhoria: Salva o estado da primeira carta virada
    firstCardValue: firstCardValue, 
    firstCardOrder: firstCardOrder,
    hasFlippedCard: hasFlippedCard // Necessário para restaurar o estado 'true'
  };

  try {
    localStorage.setItem('memoryGameStatus', JSON.stringify(gameState));
    // console.log("Estado do jogo salvo.");
  } catch (e) {
    console.error("Falha ao salvar o estado do jogo no LocalStorage:", e);
  }
}


function loadGameStatus() {
  const savedState = localStorage.getItem('memoryGameStatus');

  if (savedState) {
    const gameState = JSON.parse(savedState);
    
    // 1. Cria as cartas na ordem canônica para que o array 'cards' seja populado
    createAndInitCards(); 

    const continueGame = confirm(`Um jogo em andamento foi encontrado (Tentativas: ${gameState.attempts}). Deseja continuar?`);

    if (continueGame) {
      // 2. Carrega variáveis de estado
      attempts = gameState.attempts;
      attemptsSpan.textContent = attempts;
      matchedPairs = gameState.matchedPairs;
      hasFlippedCard = gameState.hasFlippedCard;

      // 3. Restaura o estado visual e de dados das cartas
      gameState.cardsState.forEach((state, index) => {
        const card = cards[index];
        
        // Restaura a ordem (crucial)
        card.style.order = state.order;

        if (state.isMatched) {
          card.classList.add('flip', 'matched');
          card.removeEventListener('click', flipCard); 
        } else if (state.isFlipped) {
          card.classList.add('flip');
          
          // 💡 Melhoria: Restaura a referência firstCard (se for a única virada)
          if (card.dataset.cardValue === gameState.firstCardValue && card.style.order === gameState.firstCardOrder) {
              firstCard = card;
          }
        }
        
        // Adiciona listener às cartas não combinadas
        if (!state.isMatched) {
             card.addEventListener('click', flipCard);
        }
      });
      
      console.log("Jogo carregado do LocalStorage.");
      return true;
      
    } else {
      localStorage.removeItem('memoryGameStatus');
      // console.log("Estado do jogo descartado. Iniciando novo jogo.");
    }
  }
  
  return false;
}


function initGame() {
    // 1. Cria as cartas (e preenche o array 'cards')
    createAndInitCards(); 

    // 2. Embaralha as cartas
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
    
    // 3. Adiciona o evento de clique
    cards.forEach(card => card.addEventListener('click', flipCard));
    
    console.log("Novo jogo iniciado e embaralhado.");
}


// --- INICIALIZAÇÃO PRINCIPAL DO JOGO ---
if (!loadGameStatus()) {
    initGame();
    // Salva o estado inicial (embaralhado)
    saveGameStatus(); 
}

// ===================================================================
// FIM DE JOGO E SALVAMENTO DE PLACAR
// ===================================================================

function endGame() {
  lockBoard = true;
  
  localStorage.removeItem('memoryGameStatus');

  const playerName = prompt(`Parabéns! Você completou o jogo em ${attempts} tentativas.\n\nDigite seu nome para salvar:`);

  if (playerName && playerName.trim() !== "") {
    saveScoreByAjax(playerName);
  } else {
    alert("Pontuação não salva. Reiniciando o jogo.");
    window.location.href = 'index.php?page=jogar';
  }
}

/**
 * MÉTODO 1: Salvar pontuação usando AJAX (Fetch API)
 */
function saveScoreByAjax(playerName) {
  const formData = new FormData();
  formData.append('nome', playerName);
  formData.append('tentativas', attempts);

  fetch('salvar_pontuacao.php', {
    method: 'POST',
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        // Lança erro para cair no catch
        return response.json().then(err => { throw new Error(err.message || `Erro do servidor: ${response.status}`); });
      }
      return response.json();
    })
    .then(data => {
      alert("Pontuação salva! Redirecionando para o placar.");
      window.location.href = 'index.php?page=placar';
    })
    .catch(error => {
      console.error('Falha ao salvar pontuação via AJAX:', error.message);
      alert('Houve um erro ao salvar sua pontuação: ' + error.message);
      // Mantém no jogo para que o usuário possa tentar novamente, se quiser
      window.location.href = 'index.php?page=jogar'; 
    });
}
