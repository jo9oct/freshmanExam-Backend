import User from "../models/user.js";

export async function makeUniqueUsername({ name, email }) {
  // base: email local-part or sanitized name
  let base =
    (email?.split("@")[0] ||
      name?.toLowerCase().replace(/[^a-z0-9]+/g, "")) || "user";

  base = base.slice(0, 20) || "user"; // keep it tidy

  let candidate = base;
  let n = 0;

  // retry with suffix until unique
  while (await User.exists({ username: candidate })) {
    n += 1;
    candidate = `${base}${n}`;
  }
  return candidate;
}
