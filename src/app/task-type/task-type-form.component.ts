import { Directive, inject, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

import { getValidationErrorMessage, TaskDto } from '../api';
import { TaskForm } from './task.form';

/**
 * Base-class for task type form components.
 */
@Directive()
export abstract class TaskTypeFormComponent<TForm extends { [K in keyof TForm]: AbstractControl }> {

  /**
   * The error message function.
   */
  readonly getError: (control: FormControl, fieldTranslationKey: string) => string = (control, fieldTranslationKey) =>
    getValidationErrorMessage(this.translationService, control, fieldTranslationKey);

  /**
   * The form.
   */
  form!: FormGroup<TForm>;

  /**
   * The translation service.
   */
  protected readonly translationService: TranslocoService;

  private _task?: TaskDto | null;
  private _originalData?: unknown;
  private _parentForm?: FormGroup<TaskForm>;
  private _loadingCounter: number;

  /**
   * Creates a new instance of class TaskTypeFormComponent.
   */
  protected constructor() {
    this.translationService = inject(TranslocoService);
    this._loadingCounter = 0;
  }

  /**
   * Sets the form.
   *
   * @param form The form group that can be used for the customized form.
   */
  @Input({required: true}) set formGroup(form: UntypedFormGroup) {
    this.form = form;
    this.initForm();
    if (this._originalData)
      this.form.patchValue(this._originalData);
    else
      this.form.reset(this.getFormDefaultValues());
  }

  /**
   * Sets the form data.
   *
   * @param data The data to set in the form.
   */
  @Input({required: true}) set formData(data: unknown) {
    this._originalData = data;
    if (this._originalData)
      this.form.patchValue(this._originalData);
    else
      this.form.reset(this.getFormDefaultValues());
    this.onOriginalDataChanged(data);
  }

  /**
   * The original data.
   */
  get originalData(): unknown {
    return this._originalData;
  }

  /**
   * Sets the current task.
   *
   * @param value The task.
   */
  @Input({required: true}) set task(value: TaskDto | undefined | null) {
    this._task = value;
    this.onTaskChanged(value);
  }

  /**
   * The current task.
   * Do not use this to access type specific data. Use original data instead.
   */
  get task(): TaskDto | undefined | null {
    return this._task;
  }

  /**
   * Returns the parent form.
   * Can be used to modify values of the parent form.
   */
  get parentForm(): FormGroup<TaskForm> | undefined {
    return this._parentForm;
  }

  /**
   * Sets the parent form.
   *
   * @param value The parent form.
   */
  @Input({required: false}) set parentForm(value: FormGroup<TaskForm> | undefined) {
    this._parentForm = value;
  }

  /**
   * Hook that can be used to initialize the form group.
   */
  protected abstract initForm(): void;

  /**
   * Hook that can be used to handle changes of the original data.
   */
  protected onOriginalDataChanged(originalData: unknown | undefined): void {
  }

  /**
   * Hook that can be used to handle changes of the task.
   */
  protected onTaskChanged(taskGroup: TaskDto | undefined | null): void {
  }

  //#region --- Loading ---

  /**
   * Returns whether data is currently loading.
   */
  get loading(): boolean {
    return this._loadingCounter > 0;
  }

  /**
   * Sets whether data is currently loading.
   *
   * @param value Whether data is currently loading.
   */
  protected set loading(value: boolean) {
    if (value)
      this.startLoading();
    else
      this.finishLoading();
  }

  /**
   * Call this method when you start loading data.
   */
  protected startLoading(): void {
    if (this._loadingCounter < 0)
      this._loadingCounter = 0;
    this._loadingCounter++;
  }

  /**
   * Call this method when you finish loading data (or an error occurred).
   */
  protected finishLoading(): void {
    this._loadingCounter--;
    if (this._loadingCounter < 0)
      this._loadingCounter = 0;
  }

  //#endregion

  /**
   * Returns the default values for the form to use when creating a new entry.
   *
   * @return The default values for the form.
   */
  protected getFormDefaultValues(): Partial<{ [K in keyof TForm]: any }> | undefined {
    return undefined;
  }
}
