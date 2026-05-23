-- Cards table
create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word text not null,
  definition text not null,
  example text,
  category text check (category in ('word', 'idiom', 'phrasal_verb')) default 'word',
  image_url text,
  audio_url text,
  notes text,
  -- SRS fields (SM-2)
  interval integer default 0,
  repetitions integer default 0,
  ease_factor numeric default 2.5,
  next_review_date date default current_date,
  last_reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table cards enable row level security;

create policy "Users own their cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Review logs table
create table review_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  quality integer not null check (quality between 0 and 5),
  reviewed_at timestamptz default now()
);

alter table review_logs enable row level security;

create policy "Users own their review logs"
  on review_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for common queries
create index cards_user_id_next_review_date on cards (user_id, next_review_date);
create index review_logs_user_id_reviewed_at on review_logs (user_id, reviewed_at);
