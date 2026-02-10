-- ==================== Supabase Schema for QuizBook ====================
-- Run this SQL in your Supabase SQL Editor

-- 1. game_sessions 테이블 (게임 기록)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 점수 정보
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,

  -- 게임 모드 및 설정
  mode_key TEXT NOT NULL CHECK (mode_key IN ('full', 'category', 'speed')),
  mode_name TEXT NOT NULL,
  selected_category TEXT,
  selected_difficulty TEXT DEFAULT 'all',

  -- 성과 지표
  longest_streak INTEGER DEFAULT 0,
  avg_response_time NUMERIC(6,2),

  -- 시간 정보
  elapsed_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  -- 점수 분해
  base_score INTEGER DEFAULT 0,
  time_bonus INTEGER DEFAULT 0,
  combo_bonus INTEGER DEFAULT 0,
  hint_bonus INTEGER DEFAULT 0,

  -- JSON 데이터
  category_scores JSONB,
  response_times JSONB,

  CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100)
);

-- 2. user_stats 테이블 (집계 통계)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  total_games INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,

  best_score INTEGER DEFAULT 0,
  longest_streak_ever INTEGER DEFAULT 0,

  avg_accuracy NUMERIC(5,2) DEFAULT 0,
  avg_response_time NUMERIC(6,2) DEFAULT 0,

  last_played TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_profiles 테이블 (추가 프로필 정보)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  student_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_game_sessions_user_score ON game_sessions(user_id, score DESC);
CREATE INDEX idx_game_sessions_user_completed ON game_sessions(user_id, completed_at DESC);
CREATE INDEX idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX idx_game_sessions_completed ON game_sessions(completed_at DESC);

-- Row Level Security (RLS) 정책
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- game_sessions 정책
CREATE POLICY "Users can view their own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 전역 순위표용: 모든 사용자가 점수 상위 기록을 읽을 수 있음
CREATE POLICY "Anyone can view top scores"
  ON game_sessions FOR SELECT
  USING (true);

-- user_stats 정책
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own stats"
  ON user_stats FOR ALL
  USING (auth.uid() = user_id);

-- user_profiles 정책
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = user_id);

-- ==================== Triggers ====================

-- 게임 세션 저장 시 user_stats 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_games, total_correct, total_questions, best_score, longest_streak_ever, last_played)
  VALUES (
    NEW.user_id,
    1,
    NEW.correct_count,
    NEW.total_questions,
    NEW.score,
    NEW.longest_streak,
    NEW.completed_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_games = user_stats.total_games + 1,
    total_correct = user_stats.total_correct + NEW.correct_count,
    total_questions = user_stats.total_questions + NEW.total_questions,
    best_score = GREATEST(user_stats.best_score, NEW.score),
    longest_streak_ever = GREATEST(user_stats.longest_streak_ever, NEW.longest_streak),
    last_played = NEW.completed_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
AFTER INSERT ON game_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- 회원가입 시 user_profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
