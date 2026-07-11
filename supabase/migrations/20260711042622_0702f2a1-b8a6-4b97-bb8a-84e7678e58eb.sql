REVOKE ALL ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) TO service_role;