-- Caderno do Ozzy — esquema inicial
-- Papéis: admin (tudo), editor (tudo, inclusive saúde), comentarista (Silvia: lê adestramento, comenta e compartilha materiais)

-- ───────── Lista de e-mails autorizados ─────────
create table public.allowed_emails (
  email text primary key check (email = lower(email)),
  papel text not null default 'editor' check (papel in ('admin','editor','comentarista')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  papel text not null default 'comentarista' check (papel in ('admin','editor','comentarista')),
  created_at timestamptz not null default now()
);

-- Bloqueia qualquer cadastro (e-mail/senha ou Google) fora da lista
create or replace function public.bloquear_nao_autorizados()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.allowed_emails where email = lower(new.email)) then
    raise exception 'E-mail sem acesso ao Caderno do Ozzy';
  end if;
  return new;
end $$;

create trigger trg_bloquear_nao_autorizados
  before insert on auth.users
  for each row execute function public.bloquear_nao_autorizados();

create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
declare p text;
begin
  select papel into p from public.allowed_emails where email = lower(new.email);
  insert into public.profiles (id, email, nome, papel)
  values (
    new.id, lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(p,'comentarista')
  );
  return new;
end $$;

create trigger trg_criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- Papel do usuário logado (usado nas políticas)
create or replace function public.papel_atual()
returns text language sql stable security definer set search_path = public as $$
  -- vale o papel da lista de autorizados: remover o e-mail da lista revoga o acesso na hora
  select a.papel
  from public.profiles p
  join public.allowed_emails a on a.email = p.email
  where p.id = auth.uid()
$$;

create or replace function public.pode_editar()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.papel_atual() in ('admin','editor'), false)
$$;

create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.papel_atual() = 'admin', false)
$$;

-- ───────── Adestramento ─────────
create table public.aulas (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  titulo text not null,
  resumo text,
  anotacoes text,
  proximos_passos text,
  criado_por uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.licoes (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid references public.aulas(id) on delete set null,
  semana date not null default date_trunc('week', current_date)::date,
  titulo text not null,
  descricao text,
  status text not null default 'pendente' check (status in ('pendente','feito','parcial','nao_feito')),
  observacao text,
  atualizado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  url text,
  descricao text,
  aula_id uuid references public.aulas(id) on delete set null,
  compartilhado_por uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  autor_id uuid references auth.users(id) on delete set null default auth.uid(),
  texto text not null,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data date not null default current_date,
  arquivo_path text,
  url_externa text,
  criado_por uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (arquivo_path is not null or url_externa is not null)
);

-- ───────── Saúde (somente admin/editor) ─────────
create table public.consultas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo text not null default 'Consulta',
  veterinario text,
  clinica text,
  motivo text,
  observacoes text,
  retorno_em date,
  created_at timestamptz not null default now()
);

create table public.exames (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  nome text not null,
  laboratorio text,
  resultado text,
  observacoes text,
  arquivo_path text,
  created_at timestamptz not null default now()
);

create table public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  dose text,
  frequencia text,
  motivo text,
  inicio date,
  fim date,
  uso_continuo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now()
);

-- ───────── RLS ─────────
alter table public.allowed_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.aulas enable row level security;
alter table public.licoes enable row level security;
alter table public.materiais enable row level security;
alter table public.comentarios enable row level security;
alter table public.videos enable row level security;
alter table public.consultas enable row level security;
alter table public.exames enable row level security;
alter table public.medicamentos enable row level security;

-- acesso e perfis
create policy "admin gerencia lista" on public.allowed_emails for all to authenticated
  using (public.eh_admin()) with check (public.eh_admin());
create policy "ver perfis" on public.profiles for select to authenticated using (public.papel_atual() is not null);
create policy "admin altera perfis" on public.profiles for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());
create policy "admin remove perfis" on public.profiles for delete to authenticated using (public.eh_admin());

-- adestramento: todos com perfil leem; admin/editor escrevem
create policy "ler aulas" on public.aulas for select to authenticated using (public.papel_atual() is not null);
create policy "escrever aulas" on public.aulas for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

create policy "ler licoes" on public.licoes for select to authenticated using (public.papel_atual() is not null);
create policy "escrever licoes" on public.licoes for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

create policy "ler materiais" on public.materiais for select to authenticated using (public.papel_atual() is not null);
create policy "inserir materiais" on public.materiais for insert to authenticated
  with check (public.papel_atual() is not null);
create policy "editar materiais" on public.materiais for update to authenticated
  using (public.pode_editar()) with check (public.pode_editar());
create policy "remover materiais" on public.materiais for delete to authenticated using (public.pode_editar());

create policy "ler comentarios" on public.comentarios for select to authenticated using (public.papel_atual() is not null);
create policy "inserir comentarios" on public.comentarios for insert to authenticated
  with check (public.papel_atual() is not null and autor_id = auth.uid());
create policy "remover comentarios" on public.comentarios for delete to authenticated
  using (public.pode_editar() or autor_id = auth.uid());

create policy "ler videos" on public.videos for select to authenticated using (public.papel_atual() is not null);
create policy "escrever videos" on public.videos for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

-- saúde: só admin/editor
create policy "saude consultas" on public.consultas for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());
create policy "saude exames" on public.exames for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());
create policy "saude medicamentos" on public.medicamentos for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

-- Nada para anônimos
revoke all on all tables in schema public from anon;
revoke execute on function public.papel_atual(), public.pode_editar(), public.eh_admin() from anon, public;
grant execute on function public.papel_atual(), public.pode_editar(), public.eh_admin() to authenticated;

-- ───────── Storage (buckets privados) ─────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('videos','videos', false, 52428800), ('clinico','clinico', false, 20971520)
on conflict (id) do nothing;

create policy "videos: ler" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and public.papel_atual() is not null);
create policy "videos: enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.pode_editar());
create policy "videos: remover" on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.pode_editar());

create policy "clinico: ler" on storage.objects for select to authenticated
  using (bucket_id = 'clinico' and public.pode_editar());
create policy "clinico: enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'clinico' and public.pode_editar());
create policy "clinico: remover" on storage.objects for delete to authenticated
  using (bucket_id = 'clinico' and public.pode_editar());
