// ==================== Supabase Client Configuration ====================
// Supabase project credentials
// Project: dpxzwhtgakzfbdckfhxh

const SUPABASE_URL = 'https://dpxzwhtgakzfbdckfhxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweHp3aHRnYWt6ZmJkY2tmaHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjYwMDUsImV4cCI6MjA4NjEwMjAwNX0.aQRACLCl1Uoj4suLINFgbaFlAUfh7TqjiTnEp9RVJi4';

// Initialize Supabase client (loaded via CDN in index.html)
// Store in global scope for access from game.js
window.supabase = null;
window.currentUser = null;

// Initialize Supabase when available
function initSupabase() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    // Supabase library is loaded, create client
    const supabaseLib = window.supabase;
    window.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    return true;
  }
  return false;
}

// ==================== Auth Status Management ====================

async function checkAuthStatus() {
  if (!window.supabase || !window.supabase.auth) {
    console.log('⚠️ Supabase not initialized, showing login UI');
    updateUIForAuthState();
    return null;
  }

  try {
    const { data: { session } } = await window.supabase.auth.getSession();
    window.currentUser = session?.user || null;
    updateUIForAuthState();
    return window.currentUser;
  } catch (error) {
    console.error('Failed to check auth status:', error);
    updateUIForAuthState();
    return null;
  }
}

// Setup auth listener
function setupAuthListener() {
  if (!window.supabase || !window.supabase.auth) return;

  window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    window.currentUser = session?.user || null;
    updateUIForAuthState();

    // If user just signed in, migrate local data
    if (event === 'SIGNED_IN' && window.currentUser) {
      migrateLocalDataToSupabase();
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded, initializing...');

  // Wait for Supabase to load
  if (initSupabase()) {
    setupAuthListener();
    checkAuthStatus();
  } else {
    // Retry after a short delay
    setTimeout(() => {
      if (initSupabase()) {
        setupAuthListener();
        checkAuthStatus();
      } else {
        console.error('❌ Supabase failed to load');
        updateUIForAuthState(); // Show UI anyway
      }
    }, 100);
  }
});

// ==================== UI Update ====================

function updateUIForAuthState() {
  const loggedInBar = document.getElementById('logged-in-bar');
  const loggedOutBar = document.getElementById('logged-out-bar');
  const userNameDisplay = document.getElementById('user-name-display');

  if (!loggedInBar || !loggedOutBar) {
    console.log('⚠️ Auth UI elements not found yet');
    return;
  }

  console.log('🔄 Updating UI, currentUser:', window.currentUser ? 'logged in' : 'guest');

  if (window.currentUser) {
    // Logged in state
    loggedInBar.style.display = 'flex';
    loggedOutBar.style.display = 'none';

    // Display user name
    if (userNameDisplay) {
      const displayName = window.currentUser.user_metadata?.name ||
                         window.currentUser.email.split('@')[0];
      userNameDisplay.textContent = displayName;
    }

  } else {
    // Logged out state (guest mode)
    loggedInBar.style.display = 'none';
    loggedOutBar.style.display = 'flex';
  }
}

// ==================== Data Migration ====================

async function migrateLocalDataToSupabase() {
  if (!window.currentUser || !window.supabase) return;

  const localData = LocalDataManager._load();
  if (!localData.results || localData.results.length === 0) return;

  try {
    console.log(`Migrating ${localData.results.length} local games to Supabase...`);

    const sessions = localData.results.map(result => ({
      user_id: window.currentUser.id,
      score: result.score || 0,
      accuracy: result.accuracy || 0,
      correct_count: result.correct || 0,
      total_questions: result.total || 0,
      mode_key: result.modeKey || 'full',
      mode_name: result.mode || '전체 도전',
      selected_category: result.selectedCategory,
      selected_difficulty: 'all',
      longest_streak: result.streak || 0,
      elapsed_seconds: 0,
      completed_at: result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
      base_score: result.totalBaseScore || 0,
      time_bonus: result.totalTimeBonus || 0,
      combo_bonus: result.totalComboBonus || 0,
      hint_bonus: result.totalHintBonus || 0,
      category_scores: result.categoryScores,
      response_times: [],
      avg_response_time: result.avgResponseTime || 0
    }));

    const { error } = await window.supabase.from('game_sessions').insert(sessions);

    if (error) throw error;

    console.log(`✅ Successfully migrated ${sessions.length} games to Supabase`);

  } catch (error) {
    console.error('Migration failed:', error);
    // Fallback: keep using localStorage
  }
}
