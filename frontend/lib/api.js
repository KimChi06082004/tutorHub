export async function register(full_name, email, password, role = "student") {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, role }),
  });
  return res.json();
}
