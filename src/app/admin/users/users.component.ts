import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';

import { ConfirmationService, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

import { TableDialogOverviewComponent } from '../../layout';
import { UserDto, UserService } from '../../api';
import { AuthService } from '../../auth';
import { UserFormComponent } from './user-form/user-form.component';
import { ChangePasswordFormComponent } from './change-password-form/change-password-form.component';

/**
 * Page: Users Overview
 */
@Component({
  selector: 'dke-users',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmPopupModule,
    InputTextModule,
    SharedModule,
    TableModule,
    TagModule,
    TranslocoDirective,
    TranslocoPipe,
    TooltipModule,
    CheckboxModule,
    FormsModule
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent extends TableDialogOverviewComponent<UserDto, UserService> {

  /**
   * Whether the current user is full administrator.
   */
  isFullAdmin: boolean;

  /**
   * Creates a new instance of class UsersComponent.
   */
  constructor(service: UserService, authService: AuthService) {
    super(service, [{field: 'lastName', order: 1}, {field: 'firstName', order: 1}], 'users.', UserFormComponent, {
      style: {
        'max-width': '60em',
        'min-width': '40em'
      }
    });
    this.isFullAdmin = authService.user?.isFullAdmin ?? false;
  }

  override getId(entity: UserDto): string | number {
    return entity.id;
  }

  override getMessageParams(entity: UserDto, type: 'success' | 'error'): Record<string, unknown> {
    return {username: entity.username};
  }

  protected override async onDialogClosed(action: 'create' | 'edit', value: any): Promise<void> {
    await super.onDialogClosed(action, value);
    if (value === true)
      return;

    const entity: UserDto = {
      id: value,
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      organizationalUnits: [],
      enabled: true,
      fullAdmin: false,
      failedLoginCount: 0,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null
    };
    this.changePassword(entity);
  }

  /**
   * Opens a form to change the users' password.
   *
   * @param entity The user to change the password for.
   */
  changePassword(entity: UserDto): void {
    this.dialogService.open(ChangePasswordFormComponent, {
      header: this.translationService.translate(this.baseTranslationKey + 'changePassword'),
      data: {user: entity},
      ...this.dialogConfig
    });
  }
}
