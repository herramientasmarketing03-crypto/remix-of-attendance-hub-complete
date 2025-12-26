import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import EmployeesPage from "./pages/EmployeesPage";
import AttendancePage from "./pages/AttendancePage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ContractsPage from "./pages/ContractsPage";
import RequirementsPage from "./pages/RequirementsPage";
import RegulationsPage from "./pages/RegulationsPage";
import MessagesPage from "./pages/MessagesPage";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PayrollPage from "./pages/PayrollPage";
import VirtualAttendancePage from "./pages/VirtualAttendancePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import AgendaPage from "./pages/AgendaPage";
import PersonnelDatabasePage from "./pages/PersonnelDatabasePage";
import JustificationsPage from "./pages/JustificationsPage";
import TaskTrackerPage from "./pages/TaskTrackerPage";
import InventoryPage from "./pages/InventoryPage";
import PerformancePage from "./pages/PerformancePage";
import TerminationPage from "./pages/TerminationPage";
import SanctionsPage from "./pages/SanctionsPage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import AuditLogPage from "./pages/AuditLogPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationsProvider>
              <SettingsProvider>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/virtual-attendance" element={<ProtectedRoute allowedRoles={['jefe_area', 'empleado']}><VirtualAttendancePage /></ProtectedRoute>} />
                  <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="/regulations" element={<ProtectedRoute><RegulationsPage /></ProtectedRoute>} />
                  <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
                  <Route path="/employees" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><EmployeesPage /></ProtectedRoute>} />
                  <Route path="/departments" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><DepartmentsPage /></ProtectedRoute>} />
                  <Route path="/contracts" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><ContractsPage /></ProtectedRoute>} />
                  <Route path="/requirements" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><RequirementsPage /></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><UploadPage /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><ReportsPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><SettingsPage /></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                  <Route path="/personnel-database" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><PersonnelDatabasePage /></ProtectedRoute>} />
                  <Route path="/justifications" element={<ProtectedRoute><JustificationsPage /></ProtectedRoute>} />
                  <Route path="/task-tracker" element={<ProtectedRoute><TaskTrackerPage /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><InventoryPage /></ProtectedRoute>} />
                  <Route path="/performance" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><PerformancePage /></ProtectedRoute>} />
                  <Route path="/termination" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><TerminationPage /></ProtectedRoute>} />
                  <Route path="/sanctions" element={<ProtectedRoute allowedRoles={['admin_rrhh', 'jefe_area']}><SanctionsPage /></ProtectedRoute>} />
                  <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequestsPage /></ProtectedRoute>} />
                  <Route path="/audit-log" element={<ProtectedRoute allowedRoles={['admin_rrhh']}><AuditLogPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SettingsProvider>
            </NotificationsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
