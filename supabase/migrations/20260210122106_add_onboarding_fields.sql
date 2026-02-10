-- Add onboarding fields to profiles
ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN topics TEXT[] DEFAULT '{}';

-- Prevent future dates of birth
ALTER TABLE public.profiles ADD CONSTRAINT profiles_dob_not_future
  CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);
