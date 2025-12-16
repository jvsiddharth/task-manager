"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register(name, email, password)
      router.push("/") // redirect to dashboard after signup
    } catch (err: any) {
      setError("Account already exists or invalid input")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 rounded-xl shadow-sm space-y-4"
      >
        <h1 className="text-2xl font-semibold text-black">Create account</h1>

        <input
          className="border p-2 w-full rounded text-black"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full rounded text-black"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full rounded text-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          className="bg-black text-white w-full py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </form>
    </main>
  )
}
