import { Directive, inject, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

import { getValidationErrorMessage } from '../api';
import { TaskGroupForm } from './task-group.form';

/**
 * Base-class for task group type form components.
 */
@Directive()
export abstract class TaskGroupTypeFormComponent<TForm extends { [K in keyof TForm]: AbstractControl }> {

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

  private _originalData?: unknown;
  private _parentForm?: FormGroup<TaskGroupForm>;

  /**
   * Creates a new instance of class TaskTypeFormComponent.
   */
  protected constructor() {
    this.translationService = inject(TranslocoService);
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
      this.form.reset();
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
      this.form.reset();
  }

  /**
   * The original data.
   */
  get originalData(): unknown {
    return this._originalData;
  }

  /**
   * Returns the parent form.
   * Can be used to modify values of the parent form.
   */
  get parentForm(): FormGroup<TaskGroupForm> | undefined {
    return this._parentForm;
  }

  /**
   * Sets the parent form.
   *
   * @param value The parent form.
   */
  @Input({required: false}) set parentForm(value: FormGroup<TaskGroupForm> | undefined) {
    this._parentForm = value;
  }

  /**
   * Hook that can be used to initialize the form group.
   */
  protected abstract initForm(): void;

}
