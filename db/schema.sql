CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'TOURIST' CHECK (role IN ('TOURIST', 'AUTHORITY')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'SEVERE', 'MODERATE', 'INFO')),
  severity_rank INTEGER NOT NULL DEFAULT 0,
  area TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  issued_at TIMESTAMPTZ NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  source_name TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL,
  original_instructions TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hazards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hazard_type TEXT NOT NULL,
  area TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REPORTED', 'CLOSED')),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  geometry JSONB,
  source_name TEXT NOT NULL,
  source_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL,
  verification_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  capacity_status TEXT NOT NULL,
  available_spaces INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  last_verified_at TIMESTAMPTZ NOT NULL,
  distance_km NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'OPEN',
  source_name TEXT NOT NULL DEFAULT 'Unverified local listing',
  source_url TEXT
);

CREATE TABLE IF NOT EXISTS diplomatic_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  desk_label TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  availability_status TEXT NOT NULL DEFAULT 'ACTIVE',
  source_url TEXT
);

ALTER TABLE diplomatic_missions
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  source_name TEXT NOT NULL,
  source_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE DEFAULT ('ST-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8))),
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  group_size INTEGER NOT NULL CHECK (group_size > 0),
  needs TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
