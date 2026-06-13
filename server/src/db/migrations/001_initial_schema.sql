-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANIES
CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  website    TEXT,
  industry   VARCHAR(100),
  location   VARCHAR(255),
  notes      TEXT,
  logo_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION STATUS
CREATE TYPE application_status AS ENUM (
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
);

-- APPLICATIONS
CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  job_title     VARCHAR(255) NOT NULL,
  job_url       TEXT,
  location      VARCHAR(255),
  salary_min    INTEGER,
  salary_max    INTEGER,
  remote        BOOLEAN DEFAULT FALSE,
  status        application_status NOT NULL DEFAULT 'applied',
  applied_date  DATE,
  response_date DATE,
  notes         TEXT,
  cover_letter  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INTERVIEW TYPE
CREATE TYPE interview_type AS ENUM (
  'phone_screen',
  'technical',
  'behavioral',
  'system_design',
  'take_home',
  'final_round',
  'other'
);

-- INTERVIEWS
CREATE TABLE interviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type interview_type NOT NULL DEFAULT 'other',
  scheduled_at   TIMESTAMPTZ NOT NULL,
  duration_mins  INTEGER DEFAULT 60,
  location       TEXT,
  interviewer    VARCHAR(255),
  prep_notes     TEXT,
  outcome_notes  TEXT,
  reminder_sent  BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- REMINDER TYPE
CREATE TYPE reminder_type AS ENUM (
  'follow_up',
  'offer_deadline',
  'interview_prep',
  'custom'
);

-- REMINDERS
CREATE TABLE reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  reminder_type  reminder_type NOT NULL DEFAULT 'custom',
  remind_at      TIMESTAMPTZ NOT NULL,
  is_sent        BOOLEAN DEFAULT FALSE,
  is_dismissed   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE activity_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  event_type     VARCHAR(100) NOT NULL,
  old_value      TEXT,
  new_value      TEXT,
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_applications_user_id      ON applications(user_id);
CREATE INDEX idx_applications_status       ON applications(status);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);
CREATE INDEX idx_companies_user_id         ON companies(user_id);
CREATE INDEX idx_interviews_application    ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at   ON interviews(scheduled_at);
CREATE INDEX idx_reminders_user_remind     ON reminders(user_id, remind_at) WHERE is_sent = FALSE;
CREATE INDEX idx_activity_log_application  ON activity_log(application_id);

-- AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();