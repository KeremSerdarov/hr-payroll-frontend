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
  <main class="relative flex min-h-screen items-center justify-center app-background px-4 py-12">
    <div class="ambient-glow" aria-hidden="true"></div>
    <button type="button" class="theme-toggle absolute right-5 top-5" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
    <section class="w-full max-w-md glass-card p-8">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-widest text-theme-accent">HR Payroll</p>
        <h1 class="mt-3 text-2xl font-bold text-theme-primary">Ulgama giris</h1>
        <p class="mt-2 text-sm text-theme-muted">Dowam etmek uchun maglumatlary girizin.</p>
      </div>

      <form class="space-y-5" @submit.prevent="login">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-medium text-theme-secondary">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="email" required
            class="w-full glass-input" />
        </div>
        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-theme-secondary">Parol</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required
            class="w-full glass-input" />
        </div>

        <p v-if="error" role="alert" class="glass-error">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="btn-primary w-full">
          {{ loading ? 'Girilyar...' : 'Girmek' }}
        </button>
      </form>
    </section>
  </main>
</template>
