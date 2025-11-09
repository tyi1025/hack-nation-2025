-- Add account_created_at column to authors table to track account age for bot detection
ALTER TABLE public.authors
ADD COLUMN account_created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() - interval '1 year');