import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, UrlTree } from '@angular/router';

import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(['INSTRUCTOR'])(...guardParameters));

  let user: { maxRole: string } | undefined = undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService, useValue: {
            get user() {
              return user;
            }
          }
        }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if user has required role', async () => {
    // Arrange
    user = {maxRole: 'INSTRUCTOR'};

    // Act
    const result = await executeGuard(null!, null!);

    // Assert
    expect(result).toBe(true);
  });

  it('should return not found route if user does not have required role', async () => {
    // Arrange
    user = {maxRole: 'TUTOR'};

    // Act
    const result = await executeGuard(null!, null!);

    // Assert
    const tree = result as UrlTree;
    expect(tree).not.toBeNull();
  });

  it('should return not found route if user is not authenticated', async () => {
    // Arrange
    user = undefined;

    // Act
    const result = await executeGuard(null!, null!);

    // Assert
    const tree = result as UrlTree;
    expect(tree).not.toBeNull();
  });
});
