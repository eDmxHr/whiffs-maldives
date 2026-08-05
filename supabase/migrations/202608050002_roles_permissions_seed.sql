-- Roles
insert into public.roles (name, description) values
  ('Owner', 'Full access to every domain.'),
  ('Manager', 'Day-to-day operational access across catalog, orders, inventory, and customers.'),
  ('Staff', 'Limited operational access for fulfillment and order handling.')
on conflict (name) do nothing;

-- Permission keys (full list from docs/15, mirrors PermissionKey in src/lib/permissions.ts)
insert into public.permissions (key, description) values
  ('catalog.view', 'View catalog data'),
  ('catalog.manage', 'Manage brands, fragrances, images, notes, offerings'),
  ('orders.view', 'View orders'),
  ('orders.create', 'Create orders'),
  ('orders.update', 'Update orders'),
  ('orders.cancel', 'Cancel orders'),
  ('orders.fulfill', 'Prepare and complete order fulfillment'),
  ('payments.view', 'View payments'),
  ('payments.verify', 'Verify payments'),
  ('payments.refund', 'Process refunds'),
  ('inventory.view', 'View suppliers, bottles, inventory events'),
  ('inventory.create', 'Create suppliers and bottles'),
  ('inventory.adjust', 'Adjust bottle volume'),
  ('inventory.archive', 'Archive bottles'),
  ('customers.view', 'View customers'),
  ('customers.manage', 'Manage customers'),
  ('packaging.view', 'View packaging items and profiles'),
  ('packaging.manage', 'Manage packaging items and profiles'),
  ('expenses.view', 'View expenses'),
  ('expenses.manage', 'Manage expenses'),
  ('reports.view', 'View reports'),
  ('settings.manage', 'Manage business settings'),
  ('users.manage', 'Manage admin users'),
  ('roles.manage', 'Manage roles and permission assignments')
on conflict (key) do nothing;

-- Owner: every permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Owner'
on conflict do nothing;

-- Manager: matches ROLE_PERMISSIONS.Manager in src/lib/permissions.ts
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = any (array[
  'catalog.view', 'catalog.manage',
  'orders.view', 'orders.create', 'orders.update', 'orders.fulfill',
  'payments.view', 'payments.verify',
  'inventory.view', 'inventory.create', 'inventory.adjust',
  'customers.view', 'customers.manage',
  'packaging.view', 'packaging.manage',
  'reports.view'
])
where r.name = 'Manager'
on conflict do nothing;

-- Staff: matches ROLE_PERMISSIONS.Staff in src/lib/permissions.ts
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = any (array[
  'catalog.view',
  'orders.view', 'orders.update', 'orders.fulfill',
  'inventory.view',
  'customers.view',
  'packaging.view'
])
where r.name = 'Staff'
on conflict do nothing;
