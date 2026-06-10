import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Homeview.vue'
import Badminton from '../views/Badminton.vue'
import TicketsView from '../views/TicketsView.vue'
import LoginPage from '../views/LoginPage.vue'
import CourtSchedule from '../views/CourtSchedule.vue'
import ReservePage from '../views/ReservePage.vue'
import AdminReturnTickets from '../views/AdminReturnTickets.vue'
import ManageCourtType from '../views/ManageCourtType.vue'
import DashboardAdmin from '../views/DashboardAdmin.vue'
import Football from '../views/Football.vue'
import courtManager from '../views/courtManager.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginPage },
    { path: '/courtschedule', component: CourtSchedule},
    { path: '/home', component: HomeView},
    { path: '/reserve', component: ReservePage},
    { path: '/badminton', component: Badminton },
    { path: '/tickets', component: TicketsView },
    { path: '/admin/return-tickets', component: AdminReturnTickets},
    { path: '/managecourt', component: ManageCourtType},
    { path: '/admindashboard', component: DashboardAdmin},
    { path: '/football', component: Football},
    { path: '/workload/courtManager', name: 'courtManager', component: courtManager},
  ]
})

export default router