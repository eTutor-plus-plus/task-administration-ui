export interface ScheduledTasks {
  cron: ScheduledTaskCron[];
  fixedDelay: ScheduledTaskFixed[];
  fixedRate: ScheduledTaskFixed[];
  custom: ScheduledTaskCustom[];
}

export interface ScheduledTaskRunnable {
  target: string;
}

export interface ScheduledTaskCron {
  runnable: ScheduledTaskRunnable;
  expression: string;
}

export interface ScheduledTaskFixed {
  runnable: ScheduledTaskRunnable;
  initialDelay: string;
  interval: string;
}

export interface ScheduledTaskCustom {
  runnable: ScheduledTaskRunnable;
  trigger: string;
}
