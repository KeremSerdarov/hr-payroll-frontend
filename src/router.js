import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import AdminPayrollsView from './views/AdminPayrollsView.vue'
import EmployeePayrollsView from './views/EmployeePayrollsView.vue'
import AdminLeaveRequestsView from './views/AdminLeaveRequestsView.vue'
import EmployeeLeaveRequestsView from './views/EmployeeLeaveRequestsView.vue'
import AdminAttendancesView from './views/AdminAttendancesView.vue'
import EmployeeAttendancesView from './views/EmployeeAttendancesView.vue'

const roleHome = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/login'
}

const storedRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.role
  } catch {
    return null
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: () => roleHome(storedRole()) },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/admin', component: DashboardView, meta: { requiresAuth: true, role: 'admin', title: 'Admin paneli' } },
    { path: '/admin/payrolls', component: AdminPayrollsView, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/leave-requests', component: AdminLeaveRequestsView, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/attendances', component: AdminAttendancesView, meta: { requiresAuth: true, role: 'admin' } },
    { path: '/admin/:pathMatch(.*)*', component: DashboardView, meta: { requiresAuth: true, role: 'admin', title: 'Admin paneli' } },
    { path: '/employee', component: DashboardView, meta: { requiresAuth: true, role: 'employee', title: 'Ishgar paneli' } },
    { path: '/employee/payrolls', component: EmployeePayrollsView, meta: { requiresAuth: true, role: 'employee' } },
    { path: '/employee/payrolls/:id', component: EmployeePayrollsView, meta: { requiresAuth: true, role: 'employee' } },
    { path: '/employee/leave-requests', component: EmployeeLeaveRequestsView, meta: { requiresAuth: true, role: 'employee' } },
    { path: '/employee/attendances', component: EmployeeAttendancesView, meta: { requiresAuth: true, role: 'employee' } },
    { path: '/employee/:pathMatch(.*)*', component: DashboardView, meta: { requiresAuth: true, role: 'employee', title: 'Ishgar paneli' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  let token = localStorage.getItem('token')
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    localStorage.removeItem('user')
  }

  if (token && !['admin', 'employee'].includes(user?.role)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token = null
    user = null
  }

  if (to.meta.requiresAuth && !token) return '/login'
  if (to.meta.requiresAuth && token && user?.role !== to.meta.role) return roleHome(user?.role)
  if (to.meta.guestOnly && token) return roleHome(user?.role)
})

export default router
