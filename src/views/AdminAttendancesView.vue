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
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold text-slate-900">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-indigo-600">Gelen-giden</span>
      </div>
    </header>

    <section class="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">Gelen-giden ýazgysy</h1>
        <form class="mt-5 flex flex-wrap items-end gap-4" @submit.prevent="addAttendance">
          <label class="grid min-w-56 gap-1.5 text-sm font-medium text-slate-700">
            Işgär
            <select v-model="employeeId" required class="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
              <option value="" disabled>Işgäri saýlaň</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.user?.name || employee.name }}
              </option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Sene
            <input v-model="date" type="date" required class="rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-slate-700">
            Ýagdaýy
            <select v-model="status" class="rounded-lg border border-slate-300 bg-white px-3 py-2.5">
              <option value="present">present</option><option value="absent">absent</option><option value="leave">leave</option>
            </select>
          </label>
          <button type="submit" :disabled="submitting || employees.length === 0" class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {{ submitting ? 'Goşulýar...' : 'Ýazgy goş' }}
          </button>
        </form>
      </div>

      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Yuklenyar...</div>
        <div v-else-if="attendances.length === 0" class="p-8 text-center text-sm text-slate-500">Gelen-giden ýazgysy ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[700px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th class="px-5 py-3">Işgär</th><th class="px-5 py-3">Sene</th><th class="px-5 py-3">Ýagdaýy</th><th class="px-5 py-3"></th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in attendances" :key="item.id" class="text-slate-700">
                <td class="px-5 py-4 font-medium text-slate-900">{{ item.employee?.name || item.employee?.user?.name || '—' }}</td>
                <td class="px-5 py-4">{{ item.date }}</td>
                <td class="px-5 py-4">
                  <select v-model="selectedStatuses[item.id]" class="rounded-md border border-slate-300 bg-white px-2.5 py-1.5">
                    <option value="present">present</option><option value="absent">absent</option><option value="leave">leave</option>
                  </select>
                </td>
                <td class="px-5 py-4">
                  <button type="button" :disabled="savingId === item.id || selectedStatuses[item.id] === item.status" @click="updateAttendance(item)"
                    class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
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
