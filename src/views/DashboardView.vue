<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const payrollPath = route.meta.role === 'admin' ? '/admin/payrolls' : '/employee/payrolls'
const leaveRequestsPath = route.meta.role === 'admin' ? '/admin/leave-requests' : '/employee/leave-requests'
const attendancePath = route.meta.role === 'admin' ? '/admin/attendances' : '/employee/attendances'
const departmentsPath = '/admin/departments'
const employeesPath = '/admin/employees'

async function logout() {
  loading.value = true
  try {
    await api('/logout', { method: 'POST' })
  } catch {
    // Clear the local session even if the API is unavailable.
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    loading.value = false
    await router.push('/login')
  }
}
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 class="text-lg font-bold text-theme-primary">HR Payroll</h1>
        <div class="flex items-center gap-4">
          <RouterLink :to="payrollPath" class="text-sm font-medium text-theme-accent nav-link">Payrolls</RouterLink>
          <RouterLink :to="leaveRequestsPath" class="text-sm font-medium text-theme-accent nav-link">Leave requests</RouterLink>
          <RouterLink :to="attendancePath" class="text-sm font-medium text-theme-accent nav-link">Attendances</RouterLink>
          <RouterLink v-if="route.meta.role === 'admin'" :to="departmentsPath" class="text-sm font-medium text-theme-accent nav-link">Departments</RouterLink>
          <RouterLink v-if="route.meta.role === 'admin'" :to="employeesPath" class="text-sm font-medium text-theme-accent nav-link">Employees</RouterLink>
          <button type="button" :disabled="loading" @click="logout"
            class="btn-ghost disabled:opacity-60">
            {{ loading ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>
    <section class="mx-auto max-w-6xl px-6 py-12">
      <div class="glass-card p-8">
        <h2 class="text-2xl font-bold text-theme-primary">{{ route.meta.title }}</h2>
      </div>
    </section>
  </main>
</template>
