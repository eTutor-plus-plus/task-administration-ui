# eTutor Administration UI

User Interface for eTutor task administration-

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).

### Add new task type

Modifications **must only be made** in the following directories: `src/app/task-group-type`, `src/app/task-type`. If possible, do not add additional dependencies.

Execute the following steps to add form components for your task type:

1. Checkout this repository and create a new feature branch, e.g.
   ```shell
   git clone git@github.com:eTutor-plus-plus/task-administration-ui.git
   cd task-administration-ui
   git checkout -b feature/my-new-task-type
   ```
2. If your task-types requires task-groups, create a new component in the task-group-type directory (e.g. `ng generate component task-group-type/task-group-type-sql`).
   The component contains all task-group-type specific form fields, and it must extend the class `TaskGroupTypeFormComponent<TForm>`. Have a look at existing components to see
   how to add custom form fields. Add a new entry in the `taskTypes`-Array in file [`task-group-type.registry.ts`](src/app/task-group-type/task-group-type.registry.ts) where the
   `name` corresponds to your new task-group-type and `component` to your custom form component. Set `supportsDescriptionGeneration` if the task-app supports the automatic generation
   of descriptions. Example: 
   ```typescript
   { name: 'sql', component: TaskGroupTypeSqlComponent, supportsDescriptionGeneration: true }
   ```
3. Create a new component in the task-type directory (e.g. `ng generate component task-type/task-type-sql`). The component contains all task-type specific form fields, and it
   must extend the class `TaskTypeFormComponent<TForm>`. Have a look at existing components to see how to add custom form fields. Add a new entry in the `taskTypes`-Array in file
   `task-type.registry.ts`. The `name` corresponds to the name of the task-group-type, the `supportedTaskGroupTypes`-Array contains all task-group-types that can be used for this
   task typ. If the array is empty, no task-group can be selected for a task. If at least on item is specified, the user has to select a task-group of one of the specified types.
   `component` specifies your custom form component for the task-type and `submissionTemplate` specifies the text that is used as template for the submission of the task in the
   test-task from. `supportsDescriptionGeneration` specifies if the task-app supports the automatic generation of descriptions. Set `submissionInputLanguage` to the monaco language
   if your task-type submission only has one input called `input`; otherwise set it to `undefined` (in this case the test user has to enter the full submit json value).
   ```typescript
   { name: 'sql', supportedTaskGroupTypes: ['sql'], component: TaskTypeSqlComponent, submissionTemplate: 'SELECT * FROM test;', supportsDescriptionGeneration: false, submissionInputLanguage: 'sql' }
   ```
4. If required, create a new service in the `src/app/api/services` directory, but do not modify existing ones.
