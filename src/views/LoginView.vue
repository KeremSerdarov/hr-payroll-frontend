<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''

  try {
    const data = await api('/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
    }))

    if (data.user.role === 'admin') await router.push('/admin')
    else if (data.user.role === 'employee') await router.push('/employee')
    else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      error.value = 'Bu ulanyjy uchun giris rugsady yok.'
    }
  } catch (err) {
    if (err.status === 422 || err.status === 401) {
      const errors = err.errors
      error.value = errors
        ? Object.values(errors).flat().join(' ')
        : err.message || 'Email ya-da parol nadogry.'
    } else {
      error.value = 'Ulgama birikdirilmedi. Tazeden synanysyn.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <section class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-widest text-indigo-600">HR Payroll</p>
        <h1 class="mt-3 text-2xl font-bold text-slate-900">Ulgama giris</h1>
        <p class="mt-2 text-sm text-slate-500">Dowam etmek uchun maglumatlary girizin.</p>
      </div>

      <form class="space-y-5" @submit.prevent="login">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="email" required
            class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-slate-700">Parol</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required
            class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {{ loading ? 'Girilyar...' : 'Girmek' }}
        </button>
      </form>
    </section>
  </main>
</template>
