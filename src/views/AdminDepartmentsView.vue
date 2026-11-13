<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api'

const departments = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const editingDepartment = ref(null)
const name = ref('')
const description = ref('')
const error = ref('')

function errorText(err) {
  if (err.errors) return Object.values(err.errors).flat().join(' ')
  return err.message || 'Amal ýerine ýetirilmedi. Täzeden synanyşyň.'
}

async function loadDepartments() {
  loading.value = true
  error.value = ''
  try {
    const data = await api('/admin/departments')
    departments.value = data.data || []
  } catch (err) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

function startEdit(department) {
  editingDepartment.value = department
  name.value = department.name
  description.value = department.description || ''
  error.value = ''
}

function resetForm() {
  editingDepartment.value = null
  name.value = ''
  description.value = ''
}

async function saveDepartment() {
  saving.value = true
  error.value = ''
  const body = JSON.stringify({ name: name.value, description: description.value })

  try {
    if (editingDepartment.value) {
      await api(`/admin/departments/${editingDepartment.value.id}`, { method: 'PATCH', body })
    } else {
      await api('/admin/departments', { method: 'POST', body })
    }
    resetForm()
    await loadDepartments()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    saving.value = false
  }
}

async function deleteDepartment(department) {
  if (!window.confirm(`Delete department "${department.name}"?`)) return

  deletingId.value = department.id
  error.value = ''
  try {
    await api(`/admin/departments/${department.id}`, { method: 'DELETE' })
    await loadDepartments()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadDepartments)
</script>

<template>
  <main class="app-background min-h-screen">
    <div class="ambient-glow" aria-hidden="true"></div>
    <header class="glass-nav">
      <div class="mx-auto flex max-w-5xl items-center gap-5 px-6 py-4">
        <RouterLink to="/admin" class="text-lg font-bold nav-brand">Admin paneli</RouterLink>
        <span class="text-sm font-medium text-theme-accent">Departments</span>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme" title="Toggle color theme" onclick="window.toggleTheme()"></button>
      </div>
    </header>

    <section class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div class="glass-card p-6">
        <h1 class="text-2xl font-bold text-theme-primary">{{ editingDepartment ? 'Redaktirle' : 'Täze bölüm' }}</h1>
        <form class="mt-5 grid gap-4" @submit.prevent="saveDepartment">
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Ady
            <input v-model="name" type="text" required class="glass-input" />
          </label>
          <label class="grid gap-1.5 text-sm font-medium text-theme-secondary">
            Düşündiriş
            <textarea v-model="description" rows="3" class="glass-input" />
          </label>
          <div class="flex gap-3">
            <button type="submit" :disabled="saving" class="btn-primary">
              {{ saving ? 'Saklanyar...' : editingDepartment ? 'Üýtgetmäni sakla' : 'Bölüm döret' }}
            </button>
            <button v-if="editingDepartment" type="button" @click="resetForm" class="btn-ghost">Ýatyr</button>
          </div>
        </form>
      </div>

      <p v-if="error" role="alert" class="glass-error">{{ error }}</p>

      <div class="glass-table">
        <div v-if="loading" class="p-8 text-center text-sm text-theme-muted">Ýüklenýär...</div>
        <div v-else-if="departments.length === 0" class="p-8 text-center text-sm text-theme-muted">Bölüm ýok.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[650px] text-left text-sm">
            <thead class="table-head text-xs uppercase tracking-wide text-theme-muted">
              <tr><th class="px-5 py-3">Ady</th><th class="px-5 py-3">Düşündiriş</th><th class="px-5 py-3">Işgär sany</th><th class="px-5 py-3"></th></tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="department in departments" :key="department.id" class="text-theme-secondary">
                <td class="px-5 py-4 font-medium text-theme-primary">{{ department.name }}</td>
                <td class="px-5 py-4">{{ department.description || '—' }}</td>
                <td class="px-5 py-4">{{ department.employees_count ?? 0 }}</td>
                <td class="px-5 py-4">
                  <div class="flex gap-2">
                    <button type="button" @click="startEdit(department)" class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-theme-secondary hover:bg-white/10">Redaktirle</button>
                    <button type="button" :disabled="deletingId === department.id" @click="deleteDepartment(department)" class="btn-danger btn-small">
                      {{ deletingId === department.id ? 'Pozulýar...' : 'Poz' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
