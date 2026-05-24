-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- Custom types
create type user_role as enum ('worker', 'employer', 'investor', 'admin');
create type job_type as enum ('full_time', 'part_time', 'seasonal', 'contract', 'remote');
create type job_status as enum ('draft', 'pending', 'active', 'rejected', 'expired', 'filled');
create type application_status as enum ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
