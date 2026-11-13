<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

async function logout() {
  loading.value = true
  try {
    await api('/logout', { method: 'POST' })
  } catch {
    // Always clear the local session, even when the API is unavailable.
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    loading.value = false
    await router.push('/login')
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 class="text-lg font-bold text-slate-900">HR Payroll</h1>
        <button type="button" :disabled="loading" @click="logout"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
          {{ loading ? 'Çykylýar...' : 'Logout' }}
        </button>
      </div>
    </header>
    <section class="mx-auto max-w-6xl px-6 py-12">
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">{{ route.meta.title }}</h2>
      </div>
    </section>
  </main>
</template>
