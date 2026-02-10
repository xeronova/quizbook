// ==================== Supabase Client Configuration ====================
// Project: dpxzwhtgakzfbdckfhxh

var SUPABASE_URL = 'https://dpxzwhtgakzfbdckfhxh.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweHp3aHRnYWt6ZmJkY2tmaHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjYwMDUsImV4cCI6MjA4NjEwMjAwNX0.aQRACLCl1Uoj4suLINFgbaFlAUfh7TqjiTnEp9RVJi4';

// Save CDN library reference immediately (before anything overwrites it)
var _supabaseLib = window.supabase;
var db = null;
var currentUser = null;

// Initialize client from the saved library reference
function initSupabase() {
  if (db) return true;
  if (_supabaseLib && typeof _supabaseLib.createClient === 'function') {
    db = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    return true;
  }
  return false;
}

// ==================== Auth Status ====================

async function checkAuthStatus() {
  if (!db) { updateUIForAuthState(); return null; }
  try {
    var resp = await db.auth.getSession();
    currentUser = (resp.data.session && resp.data.session.user) || null;
    updateUIForAuthState();
    return currentUser;
  } catch (e) {
    console.error('Auth check failed:', e);
    updateUIForAuthState();
    return null;
  }
}

function setupAuthListener() {
  if (!db) return;
  db.auth.onAuthStateChange(function(event, session) {
    currentUser = (session && session.user) || null;
    updateUIForAuthState();
    if (event === 'SIGNED_IN' && currentUser) {
      migrateLocalDataToSupabase();
    }
  });
}

// ==================== Init on Load ====================

document.addEventListener('DOMContentLoaded', function() {
  if (initSupabase()) {
    setupAuthListener();
    checkAuthStatus();
  } else {
    console.error('Supabase library not loaded');
    updateUIForAuthState();
  }
});

// ==================== UI Update ====================

function updateUIForAuthState() {
  var loggedInBar = document.getElementById('logged-in-bar');
  var loggedOutBar = document.getElementById('logged-out-bar');
  var userNameDisplay = document.getElementById('user-name-display');
  if (!loggedInBar || !loggedOutBar) return;

  if (currentUser) {
    loggedInBar.style.display = 'flex';
    loggedOutBar.style.display = 'none';
    if (userNameDisplay) {
      var name = (currentUser.user_metadata && currentUser.user_metadata.name) ||
                 currentUser.email.split('@')[0];
      userNameDisplay.textContent = name;
    }
  } else {
    loggedInBar.style.display = 'none';
    loggedOutBar.style.display = 'flex';
  }
}

// ==================== Data Migration ====================

async function migrateLocalDataToSupabase() {
  if (!currentUser || !db) return;
  var localData = LocalDataManager._load();
  if (!localData.results || localData.results.length === 0) return;

  try {
    var sessions = localData.results.map(function(r) {
      return {
        user_id: currentUser.id,
        score: r.score || 0, accuracy: r.accuracy || 0,
        correct_count: r.correct || 0, total_questions: r.total || 0,
        mode_key: r.modeKey || 'full', mode_name: r.mode || '전체 도전',
        selected_category: r.selectedCategory, selected_difficulty: 'all',
        longest_streak: r.streak || 0, elapsed_seconds: 0,
        completed_at: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
        base_score: r.totalBaseScore || 0, time_bonus: r.totalTimeBonus || 0,
        combo_bonus: r.totalComboBonus || 0, hint_bonus: r.totalHintBonus || 0,
        category_scores: r.categoryScores, response_times: [],
        avg_response_time: r.avgResponseTime || 0
      };
    });
    var result = await db.from('game_sessions').insert(sessions);
    if (result.error) throw result.error;
    console.log('Migrated ' + sessions.length + ' games to Supabase');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}
