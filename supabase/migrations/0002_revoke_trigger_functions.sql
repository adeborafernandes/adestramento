-- Funções de gatilho não precisam ser chamáveis via API
revoke execute on function public.bloquear_nao_autorizados(), public.criar_perfil() from anon, authenticated, public;
