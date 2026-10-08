/**
 * Demo-mode API mock.
 *
 * Active only when the build sets VITE_DEMO_MODE=true (used for the public
 * GitHub Pages preview). It mirrors the real Laravel API's endpoints and
 * response shapes with in-memory sample data, so the preview is fully
 * clickable without a backend. The shipped product defaults to the real API.
 */

const ADMIN = {
  id: 1,
  name: "Admin",
  email: "admin@demo.io",
  role: "admin",
  email_verified_at: "2026-10-08T15:49:08.000000Z",
  created_at: "2026-10-08T15:49:08.000000Z",
  updated_at: "2026-10-08T15:49:08.000000Z",
};

const SAMPLE_NAMES = [
  ["Ayesha Khan", "ayesha@example.com"],
  ["Bilal Ahmed", "bilal@example.com"],
  ["Chen Wei", "chen@example.com"],
  ["Dana Smith", "dana@example.com"],
  ["Elena Petrova", "elena@example.com"],
  ["Fahad Malik", "fahad@example.com"],
  ["Grace Lee", "grace@example.com"],
  ["Hassan Raza", "hassan@example.com"],
];

function seedUsers() {
  return [
    ADMIN,
    ...SAMPLE_NAMES.map(([name, email], i) => ({
      id: i + 2,
      name,
      email,
      role: "user",
      email_verified_at: "2026-10-08T15:49:08.000000Z",
      created_at: "2026-10-08T15:49:08.000000Z",
      updated_at: "2026-10-08T15:49:08.000000Z",
    })),
  ];
}

let users = seedUsers();
let currentUser = null;
let nextId = 100;

const ok = (data) => Promise.resolve({ data });
const fail = (status, message, errors = {}) =>
  Promise.reject({ response: { status, data: { message, errors } } });

function paginate(list, page, perPage) {
  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), lastPage);
  const slice = list.slice((current - 1) * perPage, current * perPage);
  return {
    data: slice,
    meta: {
      current_page: current,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export function createDemoClient() {
  return {
    async post(url, body = {}) {
      if (url === "/auth/login") {
        if (body.email === "admin@demo.io" && body.password === "password") {
          currentUser = ADMIN;
          return ok({ user: ADMIN, token: "demo-token-admin" });
        }
        return fail(422, "These credentials do not match our records.", {
          email: ["These credentials do not match our records."],
        });
      }
      if (url === "/auth/register") {
        if (!body.name || !body.email || !body.password) {
          return fail(422, "The given data was invalid.", {
            email: ["Please fill in all fields."],
          });
        }
        const user = {
          id: nextId++,
          name: body.name,
          email: body.email,
          role: "user",
          email_verified_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        users.push(user);
        currentUser = user;
        return ok({ user, token: "demo-token-user" });
      }
      if (url === "/auth/logout") {
        currentUser = null;
        return ok({ message: "Logged out." });
      }
      if (url === "/users") {
        const user = {
          id: nextId++,
          name: body.name || "New User",
          email: body.email || `user${nextId}@example.com`,
          role: body.role === "admin" ? "admin" : "user",
          email_verified_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        users.push(user);
        return ok({ user });
      }
      return fail(404, "Not found.");
    },

    async get(url, config = {}) {
      if (url === "/auth/me") {
        if (!currentUser) return fail(401, "Unauthenticated.");
        return ok({ user: currentUser });
      }
      if (url === "/dashboard/stats") {
        const admins = users.filter((u) => u.role === "admin").length;
        return ok({
          total_users: users.length,
          new_users_this_week: users.length,
          admins_count: admins,
          active_tokens: 2,
        });
      }
      if (url === "/users") {
        const page = Number(config.params?.page || 1);
        const perPage = Number(config.params?.per_page || 10);
        return ok(paginate(users, page, perPage));
      }
      return fail(404, "Not found.");
    },

    async put(url, body = {}) {
      const m = url.match(/^\/users\/(\d+)$/);
      if (m) {
        const user = users.find((u) => u.id === Number(m[1]));
        if (!user) return fail(404, "User not found.");
        Object.assign(user, {
          name: body.name ?? user.name,
          email: body.email ?? user.email,
          role: body.role ?? user.role,
          updated_at: new Date().toISOString(),
        });
        return ok({ user });
      }
      return fail(404, "Not found.");
    },

    async delete(url) {
      const m = url.match(/^\/users\/(\d+)$/);
      if (m) {
        const id = Number(m[1]);
        if (id === 1) return fail(422, "You cannot delete your own account.");
        users = users.filter((u) => u.id !== id);
        return ok({ message: "User deleted." });
      }
      return fail(404, "Not found.");
    },
  };
}

/** True when this build is the public interactive preview. */
export const isDemoMode = () =>
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_DEMO_MODE === "true";
