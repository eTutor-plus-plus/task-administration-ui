import { Directive, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { TranslocoService } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { ApiService, getValidationErrorMessage } from '../../api';

/**
 * Base component for forms.
 */
@Directive()
export abstract class EditFormComponent<TDto extends object, TService extends ApiService<TDto, any, any, object, any>, TForm extends { [K in keyof TForm]: AbstractControl<any>; }> {
  /**
   * The error message function.
   */
  readonly getError: (control: FormControl, fieldTranslationKey: string) => string = (control, fieldTranslationKey) =>
    getValidationErrorMessage(this.translationService, control, fieldTranslationKey);

  /**
   * The form.
   */
  readonly form: FormGroup<TForm>;

  /**
   * The original entity (if null, the form is in creation-mode).
   */
  originalEntity: TDto | null;

  /**
   * Returns whether data are loading.
   */
  loading: boolean;

  /**
   * The base translation key. Must end with a dot!
   */
  readonly baseTranslationKey: string;

  /**
   * The translation service.
   */
  protected readonly translationService: TranslocoService;

  /**
   * The message service.
   */
  protected readonly messageService: MessageService;

  /**
   * The entity service.
   */
  protected readonly entityService: TService;

  /**
   * Creates a new instance of class EditFormComponent.
   *
   * @param entityService The entity service.
   * @param form The form.
   * @param baseTranslationKey The base translation key. Must end with a dot!
   */
  protected constructor(entityService: TService, form: FormGroup<TForm>, baseTranslationKey: string) {
    this.entityService = entityService;
    this.form = form;
    this.baseTranslationKey = baseTranslationKey;
    this.originalEntity = null;
    this.loading = false;
    this.translationService = inject(TranslocoService);
    this.messageService = inject(MessageService);
  }

  /**
   * Closes the form.
   */
  abstract cancel(): void | Promise<void>;

  /**
   * Submits the form.
   */
  async submit(): Promise<void> {
    if (this.form.invalid)
      return;

    this.loading = true;
    if (this.originalEntity)
      await this.update();
    else
      await this.create();
  }

  /**
   * Creates a new entity.
   */
  protected async create(): Promise<void> {
    try {
      const result = await this.entityService.create(this.modifyValueBeforeSend(this.form.value as any, 'create'));
      this.messageService.add({
        severity: 'success',
        detail: this.translationService.translate(this.baseTranslationKey + 'success.create', this.getMessageParams(result, 'successCreate')),
        key: 'global'
      });
      this.onSuccess('create');
    } catch (err) {
      let detail = '';
      if (err instanceof HttpErrorResponse) {
        if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }

      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate(this.baseTranslationKey + 'errors.create', this.getMessageParams(this.form.value as any, 'errorCreate')) + ' ' + detail
      });
      this.onError('create', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Updates an existing entity.
   */
  protected async update(): Promise<void> {
    if (!this.originalEntity)
      return;

    try {
      await this.entityService.update(this.getId(this.originalEntity), this.modifyValueBeforeSend(this.form.value as any, 'update'), this.getLastModifiedDate(this.originalEntity));
      this.messageService.add({
        severity: 'success',
        detail: this.translationService.translate(this.baseTranslationKey + 'success.update', this.getMessageParams(this.form.value as any, 'successUpdate')),
        key: 'global'
      });
      this.onSuccess('update');
    } catch (err) {
      let msg = this.translationService.translate(this.baseTranslationKey + 'errors.update', this.getMessageParams(this.form.value as any, 'errorUpdate'));

      if (err instanceof HttpErrorResponse) {
        if (err.status === 409)
          msg += ' ' + this.translationService.translate('common.concurrency-error');
        else if (err.error?.detail)
          msg += ' ' + err.error.detail;
        else
          msg += ' ' + err.message;
      }

      this.messageService.add({severity: 'error', detail: msg});
      this.onError('update', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Modifies the form data before sending.
   *
   * @param data The form data.
   * @param type The operation type.
   * @return Modified form data that should be sent to the server.
   */
  modifyValueBeforeSend(data: Partial<{ [K in keyof TForm]: any; }>, type: 'create' | 'update'): any {
    return data;
  }

  /**
   * Called when the operation was successful.
   *
   * @param operation The type of the operation.
   */
  onSuccess(operation: 'create' | 'update'): void | Promise<void> {
  }

  /**
   * Called when the operation failed.
   *
   * @param operation The type of the operation.
   * @param error The error.
   */
  onError(operation: 'create' | 'update', error: unknown): void | Promise<void> {
  }

  /**
   * Returns the id of the specified entity.
   *
   * @param entity The entity.
   */
  abstract getId(entity: TDto): string | number;

  /**
   * Returns the last modified date of the specified entity.
   *
   * @param entity The entity.
   */
  abstract getLastModifiedDate(entity: TDto): string | null;

  /**
   * Returns the message params for the specified entity and message type.
   *
   * @param entity The entity.
   * @param type The message type.
   */
  abstract getMessageParams(entity: TDto | { [K in keyof TForm]: any; }, type: 'successCreate' | 'errorCreate' | 'successUpdate' | 'errorUpdate'): Record<string, unknown>;
}
