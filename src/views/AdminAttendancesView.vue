<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const attendances = ref([])
const employees = ref([])
const selectedStatuses = ref({})
const employeeId = ref('')
const date = ref('')
const status = ref('present')
const loading = ref(true)
const submitting = ref(false)
const savingId = ref(null)
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Amal ýerine ýetirilmedi. Täzeden synanyşyň.'
}

async function loadAttendances() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/attendances')
    attendances.value = data.data || []
    selectedStatuses.value = Object.fromEntries(attendances.value.map((item) => [item.id, item.status]))
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

async function loadEmployees() {
  try {
    const data = await api('/admin/employees')
    employees.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  }
}

async function addAttendance() {
  submitting.value = true
  error.value = ''
  try {
    await api('/admin/attendances', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: Number(employeeId.value),
        date: date.value,
        status: status.value,
      }),
    })
    date.value = ''
    await loadAttendances()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    submitting.value = false
  }
}

async function updateAttendance(item) {
  savingId.value = item.id
  error.value = ''
  try {
    await api(`/admin/attendances/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: selectedStatuses.value[item.id] }),
    })
    await loadAttendances()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    savingId.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadAttendances(), loadEmployees()])
})
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-6xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold nav-brand">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Gelen-giden</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div class="glass-card p-6">
        <h1 class="text-2xl font-bold text-theme-primary">Gelen-giden ýazgysy</h1>
        <form class="mt-5 flex flex-wrap items-end gap-4" @submit.prevent="addAttendance">
          <label class="grid min-w-56 gap-1.5 text-sm font-medium text-theme-secondary">
            Işgär
            <select v-model="employeeId" required class="glass-input">
              <option value="" disabled>Işgäri saýlaň</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.user?.name || employee.name }}
              </option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Sene
            <input v-model="date" type="date" required class="glass-input" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Ýagdaýy
            <select v-model="status" class="glass-input">
              <option value="present">present</option><option value="absent">absent</option><option value="leave">leave</option>
            </select>
          </label>
          <button type="submit" :disabled="submitting || employees.length === 0" class="btn-primary">
            {{ submitting ? 'Goşulýar...' : 'Ýazgy goş' }}
          </button>
        </form>
      </div>

      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>

      <div class="glass-table">
        <div v-if="loading" class="p-8 text-center text-sm text-theme-muted">Yuklenyar...</div>
        <div v-else-if="attendances.length === 0" class="p-8 text-center text-sm text-theme-muted">Gelen-giden ýazgysy ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[700px] text-left text-sm">
            <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
              <tr><th class="px-5 py-3">Işgär</th><th class="px-5 py-3">Sene</th><th class="px-5 py-3">Ýagdaýy</th><th class="px-5 py-3"></th></tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="item in attendances" :key="item.id" class="text-theme-secondary">
                <td class="px-5 py-4 font-medium text-theme-primary">{{ item.employee?.name || item.employee?.user?.name || '—' }}</td>
                <td class="px-5 py-4">{{ item.date }}</td>
                <td class="px-5 py-4">
                  <select v-model="selectedStatuses[item.id]" class="glass-input compact-input">
                    <option value="present">present</option><option value="absent">absent</option><option value="leave">leave</option>
                  </select>
                </td>
                <td class="px-5 py-4">
                  <button type="button" :disabled="savingId === item.id || selectedStatuses[item.id] === item.status" @click="updateAttendance(item)"
                    class="btn-primary btn-small">
                    {{ savingId === item.id ? 'Saklanyar...' : 'Ýatda sakla' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
