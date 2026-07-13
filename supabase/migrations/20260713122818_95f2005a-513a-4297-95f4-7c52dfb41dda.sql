-- FIX: anon cannot evaluate RLS policies that call security-definer helpers
-- Symptom: /signup/agency shows "Carregando planos..." forever because
-- plans_public_read policy calls is_super_admin() and anon lacks EXECUTE.
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_agency_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_agency_owner_of(uuid) TO anon, authenticated;