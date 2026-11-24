create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text not null default '',
  role text not null check (role in ('customer', 'seller', 'admin')),
  seller_brand_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists phone text not null default '';

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists points_balance integer not null default 0,
  add column if not exists total_points_earned integer not null default 0,
  add column if not exists total_points_redeemed integer not null default 0,
  add column if not exists favorite_product_ids text[] not null default '{}',
  add column if not exists favorite_brand_ids text[] not null default '{}',
  add column if not exists notifications_enabled boolean not null default true;

alter table public.profiles enable row level security;

revoke insert, update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (
  email,
  name,
  phone,
  avatar_url,
  points_balance,
  total_points_earned,
  total_points_redeemed,
  favorite_product_ids,
  favorite_brand_ids,
  notifications_enabled,
  updated_at
) on table public.profiles to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.customer_account_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  addresses jsonb not null default '[]'::jsonb,
  orders jsonb not null default '[]'::jsonb,
  redemptions jsonb not null default '[]'::jsonb,
  cart jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.customer_account_data enable row level security;

grant select, insert, update on table public.customer_account_data to authenticated;

drop policy if exists "Users can view their own account data" on public.customer_account_data;
drop policy if exists "Users can insert their own account data" on public.customer_account_data;
drop policy if exists "Users can update their own account data" on public.customer_account_data;

create policy "Users can view their own account data"
  on public.customer_account_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own account data"
  on public.customer_account_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own account data"
  on public.customer_account_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.get_manageable_orders()
returns table (order_data jsonb)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_role text;
  caller_seller_brand_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select role, seller_brand_id
    into caller_role, caller_seller_brand_id
    from public.profiles
    where id = auth.uid();

  if auth.uid() is null or caller_role is null or caller_role not in ('seller', 'admin') then
    raise exception 'Only sellers and admins can view platform orders.';
  end if;

  if caller_role = 'admin' then
    return query
      select order_item.value
        from public.customer_account_data account_data
        cross join lateral jsonb_array_elements(account_data.orders) as order_item(value);
  else
    return query
      select order_item.value
        from public.customer_account_data account_data
        cross join lateral jsonb_array_elements(account_data.orders) as order_item(value)
        where order_item.value->>'sellerId' = caller_seller_brand_id;
  end if;
end;
$$;

revoke all on function public.get_manageable_orders() from public;
grant execute on function public.get_manageable_orders() to authenticated;

create or replace function public.update_manageable_order_status(
  p_order_id text,
  p_customer_user_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_role text;
  caller_seller_brand_id text;
  customer_order jsonb;
  updated_order jsonb;
  points_awarded boolean;
  points_to_award integer;
begin
  if auth.uid() is null or p_order_id is null or p_customer_user_id is null or p_status is null then
    raise exception 'Authentication and valid order details are required.';
  end if;

  if p_status not in ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled') then
    raise exception 'Invalid order status.';
  end if;

  select role, seller_brand_id
    into caller_role, caller_seller_brand_id
    from public.profiles
    where id = auth.uid();

  if auth.uid() is null or caller_role is null or caller_role not in ('seller', 'admin') then
    raise exception 'Only sellers and admins can update platform orders.';
  end if;

  select order_item.value
    into customer_order
    from public.customer_account_data account_data
    cross join lateral jsonb_array_elements(account_data.orders) as order_item(value)
    where account_data.user_id = p_customer_user_id
      and order_item.value->>'id' = p_order_id
    limit 1;

  if customer_order is null then
    raise exception 'Order not found.';
  end if;

  if caller_role = 'seller'
    and (customer_order->>'sellerId') is distinct from caller_seller_brand_id then
    raise exception 'You can only update orders for your shop.';
  end if;

  points_awarded := coalesce((customer_order->>'pointsAwarded')::boolean, false);
  points_to_award := floor(coalesce((customer_order->>'subtotal')::numeric, 0))::integer;
  updated_order := jsonb_set(
    jsonb_set(customer_order, '{status}', to_jsonb(p_status), true),
    '{pointsAwarded}',
    to_jsonb(points_awarded or p_status = 'Completed'),
    true
  );

  update public.customer_account_data account_data
    set orders = (
      select coalesce(
        jsonb_agg(
          case
            when order_item.value->>'id' = p_order_id then updated_order
            else order_item.value
          end
          order by order_item.ordinality
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(account_data.orders) with ordinality as order_item(value, ordinality)
    ),
    updated_at = now()
    where account_data.user_id = p_customer_user_id;

  if p_status = 'Completed' and not points_awarded then
    update public.profiles
      set points_balance = points_balance + points_to_award,
          total_points_earned = total_points_earned + points_to_award,
          updated_at = now()
      where id = p_customer_user_id;
  end if;

  return updated_order;
end;
$$;

revoke all on function public.update_manageable_order_status(text, uuid, text) from public;
grant execute on function public.update_manageable_order_status(text, uuid, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role, seller_brand_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case
      when new.raw_user_meta_data->>'role' = 'seller' then 'seller'
      else 'customer'
    end,
    new.raw_user_meta_data->>'seller_brand_id'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, name, phone, role, seller_brand_id)
select
  auth_user.id,
  coalesce(auth_user.email, ''),
  coalesce(auth_user.raw_user_meta_data->>'name', split_part(coalesce(auth_user.email, ''), '@', 1)),
  coalesce(auth_user.raw_user_meta_data->>'phone', ''),
  case
    when auth_user.raw_user_meta_data->>'role' = 'seller' then 'seller'
    else 'customer'
  end,
  auth_user.raw_user_meta_data->>'seller_brand_id'
from auth.users auth_user
left join public.profiles existing_profile on existing_profile.id = auth_user.id
where existing_profile.id is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-avatars',
  'user-avatars',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own profile photos" on storage.objects;
drop policy if exists "Users can update their own profile photos" on storage.objects;
drop policy if exists "Users can delete their own profile photos" on storage.objects;

create policy "Users can upload their own profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own profile photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own profile photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';
