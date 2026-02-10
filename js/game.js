// ==================== Score Manager ====================
const ScoreManager = {
  basePoints: 10,

  calculateScore(isCorrect, timeSpent, consecutiveCorrect, hintUsed) {
    if (!isCorrect) return { total: 0, base: 0, timeBonus: 0, comboBonus: 0, hintBonus: 0 };

    const base = this.basePoints;
    const timeBonus = timeSpent < 10 ? 3 : 0;
    const hintBonus = hintUsed ? 0 : 2;
    const comboBonus = this.getComboBonus(consecutiveCorrect);
    const total = base + timeBonus + comboBonus + hintBonus;

    return { total, base, timeBonus, comboBonus, hintBonus };
  },

  getComboBonus(streak) {
    if (streak >= 10) return 5;
    if (streak >= 7) return 4;
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 0;
  }
};

// ==================== Sound Manager ====================
const SoundManager = {
  ctx: null,
  enabled: true,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { /* ignore */ }
  },

  _tone(freq1, freq2, duration, type) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq1, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq2, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch { /* ignore */ }
  },

  correct() { this._tone(600, 800, 0.2, 'sine'); },
  wrong() { this._tone(300, 200, 0.3, 'sawtooth'); },
  combo() { this._tone(500, 1000, 0.2, 'sine'); },
  tick() { this._tone(440, 440, 0.05, 'square'); }
};

// ==================== Local Data Manager ====================
const LocalDataManager = {
  STORAGE_KEY: 'quizbook_data',
  LEGACY_KEY: 'quizbook_history',
  MAX_RESULTS: 100,
  VERSION: 2,

  _getDefaultData() {
    return {
      version: this.VERSION,
      results: [],
      settings: { darkMode: false, soundEnabled: true },
      stats: { totalGames: 0, totalCorrect: 0, totalQuestions: 0 }
    };
  },

  _load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }

    // Try migrating from legacy
    return this._migrate();
  },

  _migrate() {
    const data = this._getDefaultData();
    try {
      const legacy = JSON.parse(localStorage.getItem(this.LEGACY_KEY));
      if (Array.isArray(legacy) && legacy.length > 0) {
        data.results = legacy.map(entry => ({
          score: entry.score || 0,
          accuracy: entry.accuracy || 0,
          correct: entry.correct || 0,
          total: entry.total || 0,
          mode: entry.mode || '전체 도전',
          modeKey: null,
          selectedCategory: null,
          streak: entry.streak || 0,
          date: entry.date || '',
          time: entry.time || '',
          timestamp: 0,
          categoryScores: null,
          avgResponseTime: 0,
          totalBaseScore: 0,
          totalTimeBonus: 0,
          totalComboBonus: 0,
          totalHintBonus: 0
        }));
        data.stats.totalGames = legacy.length;
        data.stats.totalCorrect = legacy.reduce((sum, e) => sum + (e.correct || 0), 0);
        data.stats.totalQuestions = legacy.reduce((sum, e) => sum + (e.total || 0), 0);
      }
    } catch { /* ignore */ }

    this._save(data);
    return data;
  },

  _save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      // Sync to legacy key for backwards compatibility
      const legacyResults = data.results.slice(0, 10).map(r => ({
        score: r.score, accuracy: r.accuracy, correct: r.correct,
        total: r.total, mode: r.mode, streak: r.streak,
        date: r.date, time: r.time
      }));
      legacyResults.sort((a, b) => b.score - a.score);
      localStorage.setItem(this.LEGACY_KEY, JSON.stringify(legacyResults));
    } catch { /* ignore */ }
  },

  saveResult(result) {
    const data = this._load();
    data.results.unshift(result);
    if (data.results.length > this.MAX_RESULTS) {
      data.results.length = this.MAX_RESULTS;
    }
    data.stats.totalGames++;
    data.stats.totalCorrect += result.correct;
    data.stats.totalQuestions += result.total;
    this._save(data);
  },

  getTopScores(limit) {
    const data = this._load();
    return data.results
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 10);
  },

  getResultsFiltered(period, category) {
    const data = this._load();
    let results = data.results;

    if (category && category !== 'all') {
      results = results.filter(r => r.selectedCategory === category);
    }

    if (period && period !== 'all') {
      const now = Date.now();
      const cutoffs = {
        today: now - 24 * 60 * 60 * 1000,
        week: now - 7 * 24 * 60 * 60 * 1000
      };
      if (cutoffs[period]) {
        results = results.filter(r => r.timestamp >= cutoffs[period]);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  },

  getCategoryStats() {
    const data = this._load();
    const catStats = {};
    data.results.forEach(r => {
      if (!r.categoryScores) return;
      Object.keys(r.categoryScores).forEach(cat => {
        if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 };
        catStats[cat].correct += r.categoryScores[cat].correct || 0;
        catStats[cat].total += r.categoryScores[cat].total || 0;
      });
    });
    return catStats;
  },

  getRecentScores(count) {
    const data = this._load();
    return data.results.slice(0, count || 20);
  },

  getStats() {
    const data = this._load();
    return data.stats;
  },

  getSetting(key) {
    const data = this._load();
    return data.settings[key];
  },

  saveSetting(key, value) {
    const data = this._load();
    data.settings[key] = value;
    this._save(data);
  }
};

// ==================== Game Modes ====================
const GAME_MODES = {
  full:     { name: '전체 도전', questions: 40, timeLimit: null },
  category: { name: '카테고리별 도전', questions: 10, timeLimit: null },
  speed:    { name: '스피드 퀴즈', questions: 20, timeLimit: 15 }
};

// ==================== Game State ====================
const state = {
  mode: 'full',
  selectedCategory: null,
  selectedDifficulty: 'all',
  currentQuestionIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  questions: [],
  answered: false,
  categoryScores: {},
  startTime: null,
  questionStartTime: null,
  // Combo
  currentStreak: 0,
  longestStreak: 0,
  // Hint
  hintsRemaining: 3,
  hintUsedThisQuestion: false,
  // Timer
  timerInterval: null,
  timeRemaining: 0,
  // Pause
  paused: false,
  pauseStartTime: null,
  totalPausedTime: 0,
  // Per-question tracking
  responseTimes: [],
  // Score breakdown
  totalBaseScore: 0,
  totalTimeBonus: 0,
  totalComboBonus: 0,
  totalHintBonus: 0
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 17; // ~106.8

// ==================== DOM Elements ====================
const $ = id => document.getElementById(id);

// ==================== Screen Management ====================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

// ==================== Mode Selection ====================
function showCategorySelect() {
  $('category-select').style.display = 'block';
}

function hideCategorySelect() {
  $('category-select').style.display = 'none';
}

function selectMode(mode, category) {
  state.mode = mode;
  state.selectedCategory = category || null;
  hideCategorySelect();
  initGame();
}

// ==================== Game Init ====================
function initGame() {
  // Init audio on user gesture
  SoundManager.init();

  // Reset all state
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.answered = false;
  state.startTime = Date.now();
  state.questionStartTime = null;
  state.currentStreak = 0;
  state.longestStreak = 0;
  state.hintsRemaining = 3;
  state.hintUsedThisQuestion = false;
  state.paused = false;
  state.totalPausedTime = 0;
  state.responseTimes = [];
  state.totalBaseScore = 0;
  state.totalTimeBonus = 0;
  state.totalComboBonus = 0;
  state.totalHintBonus = 0;

  clearTimer();

  // Initialize category scores
  state.categoryScores = {};
  CATEGORIES.forEach(cat => {
    state.categoryScores[cat] = { correct: 0, total: 0 };
  });

  // Build question set based on mode
  const modeConfig = GAME_MODES[state.mode];

  if (state.mode === 'full') {
    state.questions = [];
    CATEGORIES.forEach(cat => {
      state.questions.push(...shuffleArray(getQuestionsByCategory(cat)));
    });
  } else if (state.mode === 'category') {
    state.questions = shuffleArray(getQuestionsByCategory(state.selectedCategory));
  } else if (state.mode === 'speed') {
    const allShuffled = shuffleArray([...QUESTIONS]);
    state.questions = allShuffled.slice(0, modeConfig.questions);
  }

  // Apply difficulty filter
  if (state.selectedDifficulty !== 'all') {
    const filtered = state.questions.filter(q => q.difficulty === state.selectedDifficulty);
    if (filtered.length >= 5) {
      state.questions = filtered;
    }
    // If fewer than 5 questions, keep full set (fallback)
  }

  // Update hint count display
  $('hint-remaining').textContent = state.hintsRemaining;
  $('hint-btn').classList.remove('disabled');
  $('hint-area').style.display = 'block';

  // Show/hide timer for speed mode
  if (state.mode === 'speed') {
    $('timer-display').style.display = 'flex';
  } else {
    $('timer-display').style.display = 'none';
  }

  // Hide pause overlay
  $('pause-overlay').classList.remove('show');

  showScreen('quiz-screen');
  loadQuestion();
}

// ==================== Load Question ====================
function loadQuestion() {
  const q = state.questions[state.currentQuestionIndex];
  const total = state.questions.length;
  const current = state.currentQuestionIndex + 1;

  // Reset per-question state
  state.answered = false;
  state.hintUsedThisQuestion = false;
  state.questionStartTime = Date.now();

  // Reset UI
  $('feedback-area').classList.remove('show', 'correct', 'wrong');
  $('next-btn-area').classList.remove('show');
  $('hint-btn').classList.remove('disabled');
  if (state.hintsRemaining <= 0) {
    $('hint-btn').classList.add('disabled');
  }

  // Category icon
  const categoryIcons = {
    '한국사': '\uD83C\uDFEF',
    '과학': '\uD83D\uDD2C',
    '지리': '\uD83C\uDF0D',
    '예술과 문화': '\uD83C\uDFA8'
  };
  $('quiz-category').textContent = (categoryIcons[q.category] || '') + ' ' + q.category;
  $('quiz-progress-text').textContent = current + ' / ' + total;

  // Progress bar
  $('progress-bar').style.width = ((current / total) * 100) + '%';

  // Score
  $('current-score').textContent = state.score;

  // Combo display
  updateComboDisplay();

  // Difficulty badge
  const difficultyMap = {
    easy: { text: 'Easy', cls: 'difficulty-easy' },
    medium: { text: 'Medium', cls: 'difficulty-medium' },
    hard: { text: 'Hard', cls: 'difficulty-hard' }
  };
  const diff = difficultyMap[q.difficulty];
  $('difficulty-badge').textContent = diff.text;
  $('difficulty-badge').className = 'difficulty-badge ' + diff.cls;

  // Question
  $('question-number').textContent = 'Q' + current;
  $('question-text').textContent = q.question;

  // Options
  $('options-list').innerHTML = '';
  q.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.index = index;
    btn.innerHTML =
      '<span class="option-label">' + OPTION_LABELS[index] + '</span>' +
      '<span class="option-text">' + option + '</span>';
    btn.addEventListener('click', () => handleAnswer(index));
    $('options-list').appendChild(btn);
  });

  // Next button text
  $('next-btn').textContent = current === total ? '결과 보기' : '다음 문제';

  // Start timer for speed mode
  if (state.mode === 'speed') {
    startTimer(GAME_MODES.speed.timeLimit);
  }
}

// ==================== Timer ====================
function startTimer(seconds) {
  state.timeRemaining = seconds;
  updateTimerDisplay(seconds, seconds);

  clearTimer();
  const startTime = Date.now();
  const pausedAtStart = state.totalPausedTime;
  const totalMs = seconds * 1000;

  state.timerInterval = setInterval(() => {
    if (state.paused) return;

    const pausedSinceStart = state.totalPausedTime - pausedAtStart;
    const elapsed = Date.now() - startTime - pausedSinceStart;
    const remaining = Math.max(0, totalMs - elapsed);
    state.timeRemaining = remaining / 1000;

    var prevCeil = Math.ceil((remaining + 50) / 1000);
    var currCeil = Math.ceil(remaining / 1000);
    updateTimerDisplay(state.timeRemaining, seconds);

    // Tick sound when crossing a whole second at 5s or below
    if (currCeil <= 5 && currCeil > 0 && currCeil < prevCeil) {
      SoundManager.tick();
    }

    if (remaining <= 0) {
      clearTimer();
      handleTimeUp();
    }
  }, 50);
}

function updateTimerDisplay(remaining, total) {
  const displaySeconds = Math.ceil(remaining);
  $('timer-text').textContent = displaySeconds;

  // Update ring
  const offset = ((total - remaining) / total) * TIMER_CIRCUMFERENCE;
  $('timer-circle').setAttribute('stroke-dashoffset', offset);

  // Color change
  const circle = $('timer-circle');
  if (remaining <= 5) {
    circle.setAttribute('stroke', '#dc2626');
    $('timer-text').style.color = '#dc2626';
  } else if (remaining <= 10) {
    circle.setAttribute('stroke', '#f59e0b');
    $('timer-text').style.color = '#f59e0b';
  } else {
    circle.setAttribute('stroke', '#4f46e5');
    $('timer-text').style.color = '#4f46e5';
  }
}

function clearTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function handleTimeUp() {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.currentQuestionIndex];
  const timeSpent = GAME_MODES.speed.timeLimit;

  // Record response time
  state.responseTimes.push(timeSpent);

  // Break streak
  state.currentStreak = 0;
  state.wrongCount++;
  state.categoryScores[q.category].total++;

  // Disable all buttons, show correct answer
  const buttons = $('options-list').querySelectorAll('.option-btn');
  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.correctAnswer) btn.classList.add('correct');
  });

  // Show time-up feedback
  $('feedback-area').className = 'feedback-area show wrong';
  $('feedback-title').textContent = '\u23F0 \uC2DC\uAC04 \uCD08\uACFC!';
  $('feedback-text').textContent = q.explanation;
  $('feedback-bonus').textContent = '';
  $('next-btn-area').classList.add('show');
  $('hint-btn').classList.add('disabled');

  updateComboDisplay();
}

// ==================== Handle Answer ====================
function handleAnswer(selectedIndex) {
  if (state.answered || state.paused) return;
  state.answered = true;

  clearTimer();

  const q = state.questions[state.currentQuestionIndex];
  const isCorrect = selectedIndex === q.correctAnswer;
  const timeSpent = (Date.now() - state.questionStartTime) / 1000;
  const buttons = $('options-list').querySelectorAll('.option-btn');

  // Record response time
  state.responseTimes.push(timeSpent);

  // Update streak
  if (isCorrect) {
    state.currentStreak++;
    if (state.currentStreak > state.longestStreak) {
      state.longestStreak = state.currentStreak;
    }
  } else {
    state.currentStreak = 0;
  }

  // Calculate score
  const scoreResult = ScoreManager.calculateScore(
    isCorrect, timeSpent, state.currentStreak, state.hintUsedThisQuestion
  );

  state.score += scoreResult.total;
  state.totalBaseScore += scoreResult.base;
  state.totalTimeBonus += scoreResult.timeBonus;
  state.totalComboBonus += scoreResult.comboBonus;
  state.totalHintBonus += scoreResult.hintBonus;

  // Update category scores
  state.categoryScores[q.category].total++;
  if (isCorrect) {
    state.correctCount++;
    state.categoryScores[q.category].correct++;
  } else {
    state.wrongCount++;
  }

  $('current-score').textContent = state.score;

  // Disable all buttons
  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.correctAnswer) btn.classList.add('correct');
    if (idx === selectedIndex && !isCorrect) btn.classList.add('wrong');
  });

  // Disable hint
  $('hint-btn').classList.add('disabled');

  // Play sound
  if (isCorrect) {
    if (state.currentStreak >= 3) SoundManager.combo();
    else SoundManager.correct();
  } else {
    SoundManager.wrong();
  }

  // Show feedback
  showFeedback(isCorrect, q.explanation, scoreResult);
  updateComboDisplay();
}

// ==================== Combo Display ====================
function updateComboDisplay() {
  const combo = $('combo-display');
  if (state.currentStreak >= 2) {
    combo.style.display = 'flex';
    $('combo-count').textContent = state.currentStreak;
    combo.classList.add('combo-pop');
    setTimeout(() => combo.classList.remove('combo-pop'), 300);
  } else {
    combo.style.display = 'none';
  }
}

// ==================== Show Feedback ====================
function showFeedback(isCorrect, explanation, scoreResult) {
  $('feedback-area').className = 'feedback-area show ' + (isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    $('feedback-title').textContent = '\u2705 \uC815\uB2F5\uC785\uB2C8\uB2E4!';
  } else {
    $('feedback-title').textContent = '\u274C \uC624\uB2F5\uC785\uB2C8\uB2E4';
  }

  $('feedback-text').textContent = explanation;

  // Show bonus breakdown
  if (isCorrect) {
    const parts = [];
    parts.push('+' + scoreResult.base + ' \uAE30\uBCF8');
    if (scoreResult.timeBonus > 0) parts.push('+' + scoreResult.timeBonus + ' \uC2DC\uAC04');
    if (scoreResult.comboBonus > 0) parts.push('+' + scoreResult.comboBonus + ' \uCF64\uBCF4');
    if (scoreResult.hintBonus > 0) parts.push('+' + scoreResult.hintBonus + ' \uB178\uD78C\uD2B8');
    $('feedback-bonus').textContent = parts.join('  ') + '  =  ' + scoreResult.total + '\uC810';
  } else {
    $('feedback-bonus').textContent = '';
  }

  $('next-btn-area').classList.add('show');
  $('feedback-area').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== Hint System ====================
function useHint() {
  if (state.hintsRemaining <= 0 || state.answered || state.paused) return;

  state.hintsRemaining--;
  state.hintUsedThisQuestion = true;
  $('hint-remaining').textContent = state.hintsRemaining;

  if (state.hintsRemaining <= 0) {
    $('hint-btn').classList.add('disabled');
  }

  const q = state.questions[state.currentQuestionIndex];
  const buttons = $('options-list').querySelectorAll('.option-btn');

  // Find wrong options (not the correct answer)
  const wrongIndices = [];
  q.options.forEach((_, idx) => {
    if (idx !== q.correctAnswer) wrongIndices.push(idx);
  });

  // Shuffle and pick 2 to eliminate
  const toRemove = shuffleArray(wrongIndices).slice(0, 2);
  toRemove.forEach(idx => {
    buttons[idx].classList.add('hint-eliminated');
    buttons[idx].classList.add('disabled');
  });

  // Disable hint button after use
  $('hint-btn').classList.add('disabled');
}

// ==================== Pause System ====================
function togglePause() {
  if (state.answered && !state.paused) return;

  state.paused = !state.paused;

  if (state.paused) {
    state.pauseStartTime = Date.now();
    $('pause-overlay').classList.add('show');

    // Update pause stats
    const current = state.currentQuestionIndex + 1;
    const total = state.questions.length;
    $('pause-progress').textContent = current + '/' + total;
    $('pause-score').textContent = state.score;
    $('pause-streak').textContent = state.currentStreak;
  } else {
    const pausedDuration = Date.now() - state.pauseStartTime;
    state.totalPausedTime += pausedDuration;
    state.questionStartTime += pausedDuration;
    $('pause-overlay').classList.remove('show');
  }
}

function quitGame() {
  state.paused = false;
  clearTimer();
  $('pause-overlay').classList.remove('show');
  endGame();
}

// ==================== Next Question ====================
function nextQuestion() {
  state.currentQuestionIndex++;

  if (state.currentQuestionIndex >= state.questions.length) {
    endGame();
  } else {
    loadQuestion();
    $('quiz-screen').querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ==================== End Game ====================
function endGame() {
  clearTimer();

  const totalQuestions = state.questions.length;
  const elapsed = Math.round((Date.now() - state.startTime - state.totalPausedTime) / 1000);
  const accuracy = totalQuestions > 0 ? Math.round((state.correctCount / totalQuestions) * 100) : 0;
  const avgTime = state.responseTimes.length > 0
    ? (state.responseTimes.reduce((a, b) => a + b, 0) / state.responseTimes.length).toFixed(1)
    : 0;

  showScreen('result-screen');

  // Result icon & title
  const resultIcon = $('result-icon');
  if (accuracy >= 90) resultIcon.textContent = '\uD83C\uDF1F';
  else if (accuracy >= 70) resultIcon.textContent = '\uD83C\uDF89';
  else if (accuracy >= 50) resultIcon.textContent = '\uD83D\uDC4D';
  else resultIcon.textContent = '\uD83D\uDCAA';

  // Mode-specific subtitle
  const modeName = GAME_MODES[state.mode].name;
  const catLabel = state.selectedCategory ? ' - ' + state.selectedCategory : '';
  $('result-subtitle').textContent = modeName + catLabel;

  // Score
  $('final-score').textContent = state.score;

  // Basic stats
  $('total-questions').textContent = totalQuestions;
  $('correct-count').textContent = state.correctCount;
  $('wrong-count').textContent = state.wrongCount;

  // Rank (based on accuracy)
  const rank = getRank(accuracy);
  $('rank-icon').textContent = rank.icon;
  $('rank-title').textContent = rank.title;
  $('rank-desc').textContent = rank.desc;

  // Score breakdown
  $('breakdown-base').textContent = state.totalBaseScore;
  $('breakdown-time').textContent = '+' + state.totalTimeBonus;
  $('breakdown-combo').textContent = '+' + state.totalComboBonus;
  $('breakdown-hint').textContent = '+' + state.totalHintBonus;
  $('breakdown-total').textContent = state.score;

  // Performance stats
  $('perf-accuracy').textContent = accuracy + '%';
  $('perf-avg-time').textContent = avgTime + '\uCD08';
  $('perf-streak').textContent = state.longestStreak;
  $('perf-elapsed').textContent = formatTimeMinSec(elapsed);

  // Category results
  renderCategoryResults();

  // Prepare result object
  const resultData = {
    score: state.score,
    accuracy: accuracy,
    correct: state.correctCount,
    total: totalQuestions,
    mode: GAME_MODES[state.mode].name,
    modeKey: state.mode,
    selectedCategory: state.selectedCategory,
    streak: state.longestStreak,
    date: new Date().toLocaleDateString('ko-KR'),
    time: formatTimeMinSec(elapsed),
    timestamp: Date.now(),
    categoryScores: JSON.parse(JSON.stringify(state.categoryScores)),
    avgResponseTime: parseFloat(avgTime),
    totalBaseScore: state.totalBaseScore,
    totalTimeBonus: state.totalTimeBonus,
    totalComboBonus: state.totalComboBonus,
    totalHintBonus: state.totalHintBonus
  };

  // Save to Supabase (if logged in)
  saveGameResultToSupabase(resultData).then(() => {
    // Also save to localStorage as fallback
    LocalDataManager.saveResult(resultData);
    renderHistory();
  }).catch(() => {
    // If Supabase fails, still save to localStorage
    LocalDataManager.saveResult(resultData);
    renderHistory();
  });
}

// ==================== Rank System ====================
function getRank(accuracy) {
  if (accuracy >= 95) return { icon: '\uD83D\uDC51', title: '\uC0C1\uC2DD \uBC15\uC0AC', desc: '\uB2F9\uC2E0\uC740 \uC9C4\uC815\uD55C \uC0C1\uC2DD\uC758 \uB2EC\uC778!' };
  if (accuracy >= 85) return { icon: '\uD83C\uDF1F', title: '\uC0C1\uC2DD \uC804\uBB38\uAC00', desc: '\uB300\uB2E8\uD569\uB2C8\uB2E4! \uD574\uBC15\uD55C \uC9C0\uC2DD\uC744 \uBCF4\uC720\uD558\uACE0 \uC788\uC5B4\uC694.' };
  if (accuracy >= 70) return { icon: '\uD83D\uDCDA', title: '\uC0C1\uC2DD \uC6B0\uB4F1\uC0DD', desc: '\uD6CC\uB96D\uD574\uC694! \uC870\uAE08\uB9CC \uB354 \uB178\uB825\uD558\uBA74 \uC804\uBB38\uAC00!' };
  if (accuracy >= 50) return { icon: '\uD83D\uDE80', title: '\uC131\uC7A5\uD558\uB294 \uD559\uC2B5\uC790', desc: '\uAE30\uBCF8\uAE30\uAC00 \uD0C4\uD0C4\uD569\uB2C8\uB2E4. \uACC4\uC18D \uB3C4\uC804\uD558\uC138\uC694!' };
  return { icon: '\uD83C\uDF31', title: '\uCD08\uBCF4 \uD0D0\uD5D8\uAC00', desc: '\uC2DC\uC791\uC774 \uBC18! \uB2E4\uC2DC \uB3C4\uC804\uD574\uBCF4\uC138\uC694!' };
}

// ==================== Category Results ====================
function renderCategoryResults() {
  const container = $('category-results');
  const heading = container.querySelector('h3');
  container.innerHTML = '';
  container.appendChild(heading);

  // Only show categories that were in the game
  const relevantCats = state.mode === 'category'
    ? [state.selectedCategory]
    : CATEGORIES;

  relevantCats.forEach(cat => {
    const data = state.categoryScores[cat];
    if (!data || data.total === 0) return;
    const pct = Math.round((data.correct / data.total) * 100);

    const item = document.createElement('div');
    item.className = 'category-result-item';
    item.innerHTML =
      '<span class="cat-name">' + cat + '</span>' +
      '<div class="category-bar"><div class="category-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="cat-score">' + data.correct + '/' + data.total + '</span>';
    container.appendChild(item);
  });
}

// ==================== History (localStorage) ====================
function formatTimeMinSec(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function renderHistory() {
  const history = LocalDataManager.getTopScores(10);
  const list = $('history-list');
  const section = $('history-section');

  if (history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = '';

  history.forEach((entry, idx) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML =
      '<span class="history-rank">#' + (idx + 1) + '</span>' +
      '<span class="history-mode">' + (entry.mode || '\uC804\uCCB4') + '</span>' +
      '<span class="history-score">' + entry.score + '\uC810</span>' +
      '<span class="history-date">' + entry.date + '</span>';
    list.appendChild(item);
  });
}

// ==================== Difficulty Selection ====================
function setDifficulty(diff) {
  state.selectedDifficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.diff === diff);
  });
}

// ==================== Result Sharing ====================
function shareResult() {
  const score = $('final-score').textContent;
  const subtitle = $('result-subtitle').textContent;
  const accuracy = $('perf-accuracy').textContent;
  const streak = $('perf-streak').textContent;

  var text = '\uD83D\uDCDA \uC0C1\uC2DD \uD034\uC988\uBD81 \uACB0\uACFC\n';
  text += '\uD83C\uDFAF ' + subtitle + '\n';
  text += '\u2B50 \uC810\uC218: ' + score + '\uC810\n';
  text += '\u2705 \uC815\uB2F5\uB960: ' + accuracy + '\n';
  text += '\uD83D\uDD25 \uCD5C\uB300 \uCF64\uBCF4: ' + streak + '\uD68C\n';
  text += '\n\uB2E4\uC591\uD55C \uBD84\uC57C\uC758 \uC0C1\uC2DD\uC744 \uD14C\uC2A4\uD2B8\uD574\uBCF4\uC138\uC694!';

  var feedback = $('share-feedback');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      feedback.textContent = '\u2705 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!';
      setTimeout(function() { feedback.textContent = ''; }, 3000);
    }).catch(function() {
      prompt('\uACB0\uACFC\uB97C \uBCF5\uC0AC\uD558\uC138\uC694:', text);
    });
  } else {
    prompt('\uACB0\uACFC\uB97C \uBCF5\uC0AC\uD558\uC138\uC694:', text);
  }
}

// ==================== Stats Screen ====================
function showStatsScreen() {
  showScreen('stats-screen');
  showStatsTab('dashboard');
}

function showStatsTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.stats-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  // Update tab content
  document.querySelectorAll('.stats-tab-content').forEach(c => {
    c.classList.remove('active');
  });
  $('tab-' + tabName).classList.add('active');

  if (tabName === 'dashboard') renderDashboard();
  else if (tabName === 'leaderboard') renderLeaderboard('all');
  else if (tabName === 'growth') renderGrowthChart();
}

function renderDashboard() {
  const stats = LocalDataManager.getStats();
  const topScores = LocalDataManager.getTopScores(1);
  const bestScore = topScores.length > 0 ? topScores[0].score : 0;
  const avgAccuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  const container = $('dashboard-summary');
  if (stats.totalGames === 0) {
    container.innerHTML = '<div class="stats-empty">\uC544\uC9C1 \uD50C\uB808\uC774 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.<br>\uAC8C\uC784\uC744 \uC2DC\uC791\uD574\uBCF4\uC138\uC694!</div>';
    $('category-accuracy').innerHTML = '';
    return;
  }

  container.innerHTML =
    '<div class="dash-item"><div class="dash-value">' + stats.totalGames + '</div><div class="dash-label">\uCD1D \uD50C\uB808\uC774</div></div>' +
    '<div class="dash-item"><div class="dash-value">' + bestScore + '</div><div class="dash-label">\uCD5C\uACE0 \uC810\uC218</div></div>' +
    '<div class="dash-item"><div class="dash-value">' + avgAccuracy + '%</div><div class="dash-label">\uD3C9\uADE0 \uC815\uB2F5\uB960</div></div>' +
    '<div class="dash-item"><div class="dash-value">' + stats.totalCorrect + '</div><div class="dash-label">\uCD1D \uC815\uB2F5 \uC218</div></div>';

  renderCategoryAccuracy();
}

function renderCategoryAccuracy() {
  const catStats = LocalDataManager.getCategoryStats();
  const container = $('category-accuracy');

  if (Object.keys(catStats).length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '<h3 style="font-size:14px;font-weight:700;color:var(--gray-700);margin-bottom:12px;">\uCE74\uD14C\uACE0\uB9AC\uBCC4 \uC815\uB2F5\uB960</h3>';
  const catIcons = { '\uD55C\uAD6D\uC0AC': '\uD83C\uDFEF', '\uACFC\uD559': '\uD83D\uDD2C', '\uC9C0\uB9AC': '\uD83C\uDF0D', '\uC608\uC220\uACFC \uBB38\uD654': '\uD83C\uDFA8' };

  Object.keys(catStats).forEach(cat => {
    const data = catStats[cat];
    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    const icon = catIcons[cat] || '';
    html += '<div class="cat-accuracy-item">' +
      '<span class="ca-name">' + icon + ' ' + cat + '</span>' +
      '<div class="ca-bar"><div class="ca-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="ca-pct">' + pct + '%</span></div>';
  });

  container.innerHTML = html;
}

function renderLeaderboard(period) {
  const results = LocalDataManager.getResultsFiltered(period);
  const container = $('leaderboard-list');

  if (results.length === 0) {
    container.innerHTML = '<div class="stats-empty">\uD574\uB2F9 \uAE30\uAC04\uC758 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';
    return;
  }

  const top10 = results.slice(0, 10);
  container.innerHTML = top10.map(function(r, idx) {
    const isTop = idx < 3;
    return '<div class="lb-item' + (isTop ? ' lb-top' : '') + '">' +
      '<span class="lb-rank">#' + (idx + 1) + '</span>' +
      '<span class="lb-score">' + r.score + '\uC810</span>' +
      '<span class="lb-mode">' + (r.mode || '') + '</span>' +
      '<span class="lb-accuracy">' + r.accuracy + '%</span>' +
      '<span class="lb-date">' + (r.date || '') + '</span></div>';
  }).join('');
}

function filterLeaderboard(period) {
  document.querySelectorAll('.lb-filter').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.period === period);
  });
  renderLeaderboard(period);
}

function renderGrowthChart() {
  const recent = LocalDataManager.getRecentScores(20).reverse();
  const svg = $('growth-svg');

  if (recent.length < 2) {
    svg.parentElement.innerHTML = '<div class="stats-empty">2\uD68C \uC774\uC0C1 \uD50C\uB808\uC774\uD558\uBA74 \uC131\uC7A5 \uADF8\uB798\uD504\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.</div>';
    return;
  }

  const w = 380, h = 180;
  const padL = 35, padR = 10, padT = 15, padB = 25;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const n = recent.length;

  const scores = recent.map(function(r) { return r.score; });
  const accuracies = recent.map(function(r) { return r.accuracy; });

  const maxScore = Math.max.apply(null, scores) || 1;
  const xStep = chartW / (n - 1);

  // Build grid lines
  var html = '';
  for (var g = 0; g <= 4; g++) {
    var gy = padT + (chartH / 4) * g;
    var label = Math.round(maxScore - (maxScore / 4) * g);
    html += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="var(--gray-200)" stroke-width="0.5"/>';
    html += '<text x="' + (padL - 4) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="9" fill="var(--gray-400)">' + label + '</text>';
  }

  // Score line points
  var scorePoints = [];
  var accPoints = [];
  for (var i = 0; i < n; i++) {
    var x = padL + i * xStep;
    var sy = padT + chartH - (scores[i] / maxScore) * chartH;
    var ay = padT + chartH - (accuracies[i] / 100) * chartH;
    scorePoints.push(x.toFixed(1) + ',' + sy.toFixed(1));
    accPoints.push(x.toFixed(1) + ',' + ay.toFixed(1));
  }

  // Score area fill
  var areaStart = padL + ',' + (padT + chartH);
  var areaEnd = (padL + (n - 1) * xStep).toFixed(1) + ',' + (padT + chartH);
  html += '<polygon points="' + areaStart + ' ' + scorePoints.join(' ') + ' ' + areaEnd + '" fill="var(--primary)" opacity="0.1"/>';

  // Score line
  html += '<polyline points="' + scorePoints.join(' ') + '" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round"/>';

  // Accuracy line
  html += '<polyline points="' + accPoints.join(' ') + '" fill="none" stroke="var(--success)" stroke-width="1.5" stroke-dasharray="4,3" stroke-linejoin="round"/>';

  // Data points
  for (var j = 0; j < n; j++) {
    var px = padL + j * xStep;
    var psy = padT + chartH - (scores[j] / maxScore) * chartH;
    html += '<circle cx="' + px.toFixed(1) + '" cy="' + psy.toFixed(1) + '" r="3" fill="var(--primary)"/>';
  }

  // X-axis labels (show every few)
  var labelEvery = n <= 10 ? 1 : Math.ceil(n / 6);
  for (var k = 0; k < n; k++) {
    if (k % labelEvery === 0 || k === n - 1) {
      var lx = padL + k * xStep;
      html += '<text x="' + lx.toFixed(1) + '" y="' + (h - 4) + '" text-anchor="middle" font-size="8" fill="var(--gray-400)">' + (k + 1) + '</text>';
    }
  }

  svg.innerHTML = html;
}

// ==================== Dark Mode ====================
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  LocalDataManager.saveSetting('darkMode', newTheme === 'dark');

  const btn = $('theme-toggle');
  if (btn) {
    btn.textContent = newTheme === 'dark' ? '\u2600\uFE0F \uB77C\uC774\uD2B8\uBAA8\uB4DC' : '\uD83C\uDF19 \uB2E4\uD06C\uBAA8\uB4DC';
    btn.classList.toggle('active', newTheme === 'dark');
  }
}

// ==================== Sound Toggle ====================
function toggleSound() {
  SoundManager.enabled = !SoundManager.enabled;
  LocalDataManager.saveSetting('soundEnabled', SoundManager.enabled);

  const btn = $('sound-toggle');
  if (btn) {
    btn.textContent = SoundManager.enabled ? '\uD83D\uDD0A \uC0AC\uC6B4\uB4DC' : '\uD83D\uDD07 \uC0AC\uC6B4\uB4DC';
    btn.classList.toggle('active', !SoundManager.enabled);
  }
}

// Load saved settings on page load
(function() {
  // Dark mode
  const isDark = LocalDataManager.getSetting('darkMode');
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.textContent = '\u2600\uFE0F \uB77C\uC774\uD2B8\uBAA8\uB4DC';
        btn.classList.add('active');
      }
    });
  }

  // Sound
  var soundSetting = LocalDataManager.getSetting('soundEnabled');
  if (soundSetting === false) {
    SoundManager.enabled = false;
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('sound-toggle');
      if (btn) {
        btn.textContent = '\uD83D\uDD07 \uC0AC\uC6B4\uB4DC';
        btn.classList.add('active');
      }
    });
  }
})();

// ==================== Student Exporter ====================
const StudentExporter = {
  getStudentName() {
    const input = $('student-name-input');
    return input ? input.value.trim() : '';
  },

  setStudentName(name) {
    const input = $('student-name-input');
    if (input) input.value = name;
    LocalDataManager.saveSetting('studentName', name);
  },

  exportData() {
    const name = this.getStudentName();
    if (!name) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const data = LocalDataManager._load();
    const exportObj = {
      studentName: name,
      exportDate: new Date().toISOString(),
      version: data.version,
      results: data.results,
      stats: data.stats
    };

    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name + '_quizbook.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    var feedback = $('export-feedback');
    if (feedback) {
      feedback.textContent = '\u2705 ' + name + '_quizbook.json \uD30C\uC77C\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.';
      setTimeout(function() { feedback.textContent = ''; }, 4000);
    }
  }
};

// Load saved student name on page load
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var savedName = LocalDataManager.getSetting('studentName');
    if (savedName) {
      var input = document.getElementById('student-name-input');
      if (input) input.value = savedName;
    }
  });
})();

// ==================== Restart ====================
function restartGame() {
  showScreen('mode-screen');
  hideCategorySelect();
}

// ==================== Authentication Functions ====================

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errorEl = document.getElementById('signup-error');
  const submitBtn = document.getElementById('signup-btn');

  errorEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = '가입 중...';

  try {
    // Supabase 회원가입 (이메일 확인 비활성화 필요 - Dashboard에서 설정)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: undefined
      }
    });

    if (error) throw error;

    // 프로필 생성 (트리거가 실패한 경우 대비)
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        user_id: data.user.id,
        display_name: name,
        student_name: name
      });
    }

    alert('회원가입 성공! 로그인됩니다.');
    showScreen('start-screen');

  } catch (error) {
    errorEl.textContent = `오류: ${error.message}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '회원가입';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-btn');

  errorEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = '로그인 중...';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;
    showScreen('start-screen');

  } catch (error) {
    errorEl.textContent = `오류: ${error.message}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '로그인';
  }
}

async function handleLogout() {
  if (!confirm('로그아웃하시겠습니까?')) return;

  try {
    await supabase.auth.signOut();
    currentUser = null;
    showScreen('start-screen');
  } catch (error) {
    alert(`로그아웃 실패: ${error.message}`);
  }
}

// ==================== Supabase Data Functions ====================

async function saveGameResultToSupabase(result) {
  if (!currentUser) {
    console.log('Guest user - skipping Supabase save');
    return;
  }

  try {
    const { error } = await supabase.from('game_sessions').insert({
      user_id: currentUser.id,
      score: result.score,
      accuracy: result.accuracy,
      correct_count: result.correct,
      total_questions: result.total,
      mode_key: result.modeKey,
      mode_name: result.mode,
      selected_category: result.selectedCategory,
      selected_difficulty: state.selectedDifficulty || 'all',
      longest_streak: result.streak,
      avg_response_time: result.avgResponseTime,
      elapsed_seconds: Math.floor((Date.now() - state.startTime - state.totalPausedTime) / 1000),
      base_score: result.totalBaseScore,
      time_bonus: result.totalTimeBonus,
      combo_bonus: result.totalComboBonus,
      hint_bonus: result.totalHintBonus,
      category_scores: result.categoryScores,
      response_times: state.responseTimes
    });

    if (error) throw error;
    console.log('✅ Game result saved to Supabase');

  } catch (error) {
    console.error('❌ Supabase save failed:', error);
    // Fallback to localStorage only
  }
}

async function fetchLeaderboard(period = 'all', limit = 10) {
  try {
    let query = supabase
      .from('game_sessions')
      .select(`
        score,
        mode_name,
        completed_at,
        user_profiles!inner(display_name)
      `)
      .order('score', { ascending: false })
      .limit(limit);

    // 기간 필터
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('completed_at', today.toISOString());
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('completed_at', weekAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

async function fetchUserStats() {
  if (!currentUser) return null;

  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;

  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return null;
  }
}
