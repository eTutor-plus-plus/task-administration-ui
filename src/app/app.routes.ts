import { Routes } from '@angular/router';
import { LayoutComponent } from './layout';
import { authGuard, roleGuard } from './auth';

/**
 * The application routes.
 */
export const routes: Routes = [
  // APP
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'account',
        loadComponent: () => import('./auth/account/account.component').then(c => c.AccountComponent)
      },

      // Admin
      {
        path: 'health',
        pathMatch: 'full',
        loadComponent: () => import('./admin/system-health/system-health-overview/system-health-overview.component').then(c => c.SystemHealthOverviewComponent),
        canActivate: [roleGuard(['full_admin', 'admin', 'instructor'])]
      },
      {
        path: 'health',
        loadComponent: () => import('./admin/system-health/system-health.component').then(c => c.SystemHealthComponent),
        canActivate: [roleGuard(['full_admin'])],
        children: [
          {
            path: 'health',
            loadComponent: () => import('./admin/system-health/system-health-default/system-health-default.component').then(c => c.SystemHealthDefaultComponent)
          },
          {
            path: 'logfile',
            loadComponent: () => import('./admin/system-health/system-health-log-file/system-health-log-file.component').then(c => c.SystemHealthLogFileComponent)
          },
          {
            path: 'info',
            loadComponent: () => import('./admin/system-health/system-health-app-info/system-health-app-info.component').then(c => c.SystemHealthAppInfoComponent)
          },
          {
            path: 'metrics',
            loadComponent: () => import('./admin/system-health/system-health-metrics/system-health-metrics.component').then(c => c.SystemHealthMetricsComponent)
          },
          {
            path: 'env',
            loadComponent: () => import('./admin/system-health/system-health-env/system-health-env.component').then(c => c.SystemHealthEnvComponent)
          },
          {
            path: 'scheduledtasks',
            loadComponent: () => import('./admin/system-health/system-health-scheduled-tasks/system-health-scheduled-tasks.component').then(c => c.SystemHealthScheduledTasksComponent)
          },
          {
            path: 'flyway',
            loadComponent: () => import('./admin/system-health/system-health-flyway/system-health-flyway.component').then(c => c.SystemHealthFlywayComponent)
          }
        ]
      },
      {
        path: 'organizationalUnits',
        loadComponent: () => import('./admin/organizational-units/organizational-units.component').then(c => c.OrganizationalUnitsComponent),
        canActivate: [roleGuard(['full_admin'])]
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/users.component').then(c => c.UsersComponent),
        canActivate: [roleGuard(['admin', 'full_admin'])]
      },
      {
        path: 'taskApps',
        loadComponent: () => import('./tasks/task-apps/task-apps.component').then(c => c.TaskAppsComponent),
        canActivate: [roleGuard(['full_admin'])]
      },

      // Tasks
      {
        path: 'taskCategories',
        loadComponent: () => import('./tasks/task-categories/task-categories.component').then(c => c.TaskCategoriesComponent)
      },
      {
        path: 'taskGroups',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./tasks/task-groups/task-groups.component').then(c => c.TaskGroupsComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./tasks/task-groups/task-group-form/task-group-form.component').then(c => c.TaskGroupFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./tasks/task-groups/task-group-form/task-group-form.component').then(c => c.TaskGroupFormComponent)
          }
        ]
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./tasks/tasks/tasks.component').then(c => c.TasksComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./tasks/tasks/task-form/task-form.component').then(c => c.TaskFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./tasks/tasks/task-form/task-form.component').then(c => c.TaskFormComponent)
          }
        ]
      }
    ],
    canActivate: [authGuard]
  },

  // AUTH
  {path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)},
  {path: 'auth/forgotPassword', loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)},
  {path: 'auth/resetPassword', loadComponent: () => import('./auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)},
  {path: 'auth/activate', loadComponent: () => import('./auth/activate/activate.component').then(c => c.ActivateComponent)},

  // ERROR
  {path: 'not-found', loadComponent: () => import('./layout/not-found/not-found.component').then(c => c.NotFoundComponent)},
  {path: '**', loadComponent: () => import('./layout/not-found/not-found.component').then(c => c.NotFoundComponent)}
];
