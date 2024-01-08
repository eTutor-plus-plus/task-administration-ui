import { Directive, inject, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService, FilterMetadata, MessageService, SortMeta } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';

import { ApiService, EMPTY_PAGE, PageResult } from '../../api';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Base class for table overview components.
 */
@Directive()
export abstract class TableOverviewComponent<TDto extends object, TService extends ApiService<TDto, never, any, object, any>> {
  /**
   * The table data.
   */
  tableData: PageResult<TDto> = EMPTY_PAGE;

  /**
   * Returns whether data are loading.
   */
  loading: boolean = false;

  /**
   * The default sorting.
   */
  defaultSort: SortMeta[];

  /**
   * Reference to the data table.
   */
  @ViewChild(Table, {static: true}) table!: Table;

  /**
   * The message service.
   */
  protected readonly messageService: MessageService;

  /**
   * The confirmation service.
   */
  protected readonly confirmationService: ConfirmationService;

  /**
   * The translation service.
   */
  protected readonly translationService: TranslocoService;

  /**
   * The entity service.
   */
  protected readonly entityService: TService;

  /**
   * The base translation key. Must end with a dot!
   */
  readonly baseTranslationKey: string;

  /**
   * Creates a new instance of class TableOverviewComponent.
   *
   * @param entityService The entity service.
   * @param defaultSort The default sorting.
   * @param baseTranslationKey The base translation key. Must end with a dot!
   */
  protected constructor(entityService: TService, defaultSort: SortMeta[], baseTranslationKey: string) {
    this.defaultSort = defaultSort;
    this.entityService = entityService;
    this.baseTranslationKey = baseTranslationKey;
    this.messageService = inject(MessageService);
    this.confirmationService = inject(ConfirmationService);
    this.translationService = inject(TranslocoService);
  }

  /**
   * Loads the table data.
   *
   * @param evt The load event.
   */
  async loadTableData(evt: TableLazyLoadEvent): Promise<void> {
    try {
      setTimeout(() => this.loading = true);

      const filter: Record<string, any> = {};
      for (let filtersKey in evt.filters) {
        const tmp = evt.filters[filtersKey] as FilterMetadata;
        filter[filtersKey] = tmp?.value;
      }

      this.tableData = await this.entityService.load(evt.first ?? 0, evt.rows ?? 10,
        evt.multiSortMeta, filter);
    } catch (err) {
      let detail = 'Unknown error';
      if (err instanceof HttpErrorResponse) {
        if (err.error?.detail)
          detail = err.error.detail;
        else
          detail = err.message;
      }

      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate(this.baseTranslationKey + 'errors.load') + ' ' + detail,
        life: 10000,
        key: 'global'
      });
    } finally {
      setTimeout(() => this.loading = false);
    }
  }

  /**
   * Reloads the table data.
   */
  reload(): Promise<void> {
    return this.loadTableData(this.table.createLazyLoadMetadata());
  }

  /**
   * Opens the form for creating a new entity.
   */
  abstract create(): void | Promise<void>;

  /**
   * Returns whether a new entity can be created.
   */
  canCreate(): boolean {
    return true;
  }

  /**
   * Opens the form for editing the specified entity.
   *
   * @param entity The entity to edit.
   */
  abstract edit(entity: TDto): void | Promise<void>;

  /**
   * Returns whether the specified entity can be edited.
   *
   * @param entity The entity to edit.
   */
  canEdit(entity: TDto): boolean {
    return true;
  }

  /**
   * Deletes the specified entity.
   *
   * @param entity The entity to delete.
   * @param evt The event that triggered the delete method.
   */
  delete(entity: TDto, evt: MouseEvent): void | Promise<void> {
    if (!this.canDelete(entity))
      return;

    this.confirmationService.confirm({
      target: evt.target as EventTarget,
      message: this.translationService.translate('common.delete-confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translationService.translate('common.yes'),
      rejectLabel: this.translationService.translate('common.no'),
      accept: async () => {
        try {
          this.loading = true;
          await this.entityService.delete(this.getId(entity));
          this.messageService.add({
            severity: 'success',
            detail: this.translationService.translate(this.baseTranslationKey + 'success.delete', this.getMessageParams(entity, 'success')),
            key: 'global'
          });
          await this.reload();
        } catch (err) {
          let detail = 'Unknown error';
          if (err instanceof HttpErrorResponse) {
            if (err.error?.detail)
              detail = err.error.detail;
            else
              detail = err.message;
          }

          this.messageService.add({
            severity: 'error',
            detail: this.translationService.translate(this.baseTranslationKey + 'errors.delete', this.getMessageParams(entity, 'error')) + ' ' + detail,
            life: 10000,
            key: 'global'
          });
        } finally {
          this.loading = false;
        }
      }
    });
  }

  /**
   * Returns whether the specified entity can be deleted.
   *
   * @param entity The entity to delete.
   */
  canDelete(entity: TDto): boolean {
    return true;
  }

  /**
   * Returns the id of the specified entity.
   *
   * @param entity The entity.
   */
  abstract getId(entity: TDto): string | number;

  /**
   * Returns the message params for the specified entity and message type.
   *
   * @param entity The entity.
   * @param type The message type.
   */
  abstract getMessageParams(entity: TDto, type: 'success' | 'error'): Record<string, unknown>;
}
