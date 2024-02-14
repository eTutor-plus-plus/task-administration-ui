import { Directive, inject, Type } from '@angular/core';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SortMeta } from 'primeng/api';

import { ApiService } from '../../api';
import { TableOverviewComponent } from './table-overview.component';

/**
 * Base class for table overview components with dialogs for editing.
 */
@Directive()
export abstract class TableDialogOverviewComponent<TDto extends object, TService extends ApiService<TDto, never, never, object>> extends TableOverviewComponent<TDto, TService> {
  /**
   * The dialog service.
   */
  protected readonly dialogService: DialogService;

  /**
   * The dialog configuration.
   */
  protected readonly dialogConfig: DynamicDialogConfig;

  /**
   * The form component.
   */
  protected readonly component: Type<any>;

  /**
   * Creates a new instance of class TableDialogOverviewComponent.
   *
   * @param entityService The entity service.
   * @param defaultSort The default sorting.
   * @param baseTranslationKey The base translation key. Must end with a dot!
   * @param component The form component.
   * @param dialogConfig The dialog configuration.
   */
  protected constructor(entityService: TService, defaultSort: SortMeta[], baseTranslationKey: string,
                        component: Type<any>, dialogConfig: DynamicDialogConfig = {}) {
    super(entityService, defaultSort, baseTranslationKey);
    this.component = component;
    this.dialogConfig = dialogConfig;
    this.dialogService = inject(DialogService);
  }

  /**
   * Opens the dialog with form for creating a new entity.
   */
  override create(): void | Promise<void> {
    if (!this.canCreate())
      return;

    const ref = this.dialogService.open(this.component, {
      header: this.translationService.translate(this.baseTranslationKey + 'create'),
      ...this.dialogConfig,
      data: this.getAdditionalDialogData('create', null)
    });
    ref.onClose.subscribe(value => {
      if (!value)
        return;
      this.reload();
    });
  }

  /**
   * Opens the dialog with the form for editing the specified entity.
   *
   * @param entity The entity to edit.
   */
  override edit(entity: TDto): void | Promise<void> {
    if (!this.canEdit(entity))
      return;

    const ref = this.dialogService.open(this.component, {
      header: this.translationService.translate(this.baseTranslationKey + 'edit'),
      data: {
        entity,
        ...this.getAdditionalDialogData('edit', entity)
      },
      ...this.dialogConfig
    });
    ref.onClose.subscribe(value => {
      if (!value)
        return;
      this.reload();
    });
  }

  /**
   * Returns additional data for the dialog.
   *
   * @param action The action.
   * @param entity The entity.
   */
  getAdditionalDialogData(action: 'create' | 'edit', entity: TDto | null): Record<string, unknown> {
    return {};
  }
}
