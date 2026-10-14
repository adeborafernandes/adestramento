-- Rode DEPOIS da migração. Troque/adicione e-mails conforme necessário.
-- Você (admin) precisa estar aqui ANTES de entrar pela primeira vez.
insert into public.allowed_emails (email, papel) values
  ('dehcarrascoza@gmail.com', 'admin')
on conflict (email) do nothing;

-- Marido e Silvia podem ser adicionados depois, pela tela "Conta" do app (admin).
-- Exemplos:
-- insert into public.allowed_emails (email, papel) values ('marido@exemplo.com','editor');
-- insert into public.allowed_emails (email, papel) values ('silvia@exemplo.com','comentarista');
