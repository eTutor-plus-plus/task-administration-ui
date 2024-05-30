import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let auth = false;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: AuthService, useValue: {isAuthenticated: () => auth}}
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if authenticated', () => {
    // Arrange
    auth = true;

    // Act
    const result = executeGuard(null!, null!);

    // Assert
    expect(result).toBe(true);
  });

  it('should return UrlTree if not authenticated', () => {
    // Arrange
    auth = false;

    // Act
    const result = executeGuard(null!, null!);

    // Assert
    const tree = result as UrlTree;
    expect(tree).not.toBeNull();
  });
});
