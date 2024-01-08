import { Directive, inject } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ApiService } from '../../api';
import { EditFormComponent } from './edit-form.component';

/**
 * Base component for forms in dialogs.
 */
@Directive()
export abstract class DialogEditFormComponent<TDto extends object, TService extends ApiService<TDto, any, any, object>, TForm extends { [K in keyof TForm]: AbstractControl<any>; }> extends EditFormComponent<TDto, TService, TForm> {
  /**
   * The dialog reference.
   */
  protected readonly dialogRef: DynamicDialogRef;

  /**
   * The dialog configuration.
   */
  protected readonly dialogConf: DynamicDialogConfig;

  /**
   * Creates a new instance of class DialogEditFormComponent.
   *
   * @param entityService The entity service.
   * @param form The form.
   * @param baseTranslationKey The base translation key. Must end with a dot!
   */
  protected constructor(entityService: TService, form: FormGroup<TForm>, baseTranslationKey: string) {
    super(entityService, form, baseTranslationKey);
    this.dialogRef = inject(DynamicDialogRef);

    this.dialogConf = inject(DynamicDialogConfig);
    this.originalEntity = this.dialogConf.data?.entity ?? null;

    if (this.originalEntity)
      this.form.patchValue(this.originalEntity);
  }

  /**
   * Closes the dialog without saving changes.
   */
  override cancel(): void | Promise<void> {
    this.dialogRef.close(false);
  }

  /**
   * Closes the dialog after saving changes.
   *
   * @param operation The type of the operation.
   */
  override onSuccess(operation: 'create' | 'update'): void | Promise<void> {
    this.dialogRef.close(true);
  }
}
