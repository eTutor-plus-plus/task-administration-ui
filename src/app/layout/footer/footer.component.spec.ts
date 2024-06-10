import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { FooterComponent } from './footer.component';
import { AppInfo, SystemHealthService } from '../../api';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        TranslocoTestingModule.forRoot({translocoConfig: {availableLangs: ['de'], defaultLang: 'de'}}),
      ],
      providers: [
        {
          provide: SystemHealthService, useValue: {
            loadAppInfo: () => {
              return new Promise<AppInfo>(resolve => resolve({
                os: {name: 'win', version: '1.1', arch: 'x64'},
                java: {
                  version: '1.8.0_131',
                  vendor: {name: 'vendor', version: '1'},
                  runtime: {name: 'runtime', version: '1'},
                  jvm: {name: 'jvm', vendor: 'vendor', version: '1'}
                },
                build: {
                  name: 'app',
                  version: '1.0.0',
                  artifact: 'app',
                  group: 'com.app',
                  time: '2021-01-01T00:00:00Z'
                },
                git: {
                  branch: 'master',
                  dirty: 'false',
                  commit: {
                    time: '2021-01-01T00:00:00Z',
                    id: {
                      'describe-short': '1',
                      abbrev: '1',
                      full: '1',
                      describe: '1'
                    }
                  }
                }
              }));
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have version', () => {
    expect(component.version).toBeTruthy();
  });

  it('should have version date', () => {
    expect(component.versionDate).toBeTruthy();
  });

  it('should have impress url with lang', () => {
    expect(component.impressUrl).toContain('?lang=de');
  });

  it('should have server version', () => {
    expect(component.serverVersion).toBe('1.0.0#1');
  });

  it('should have server version date', () => {
    expect(component.serverVersionDate).toBe('01.01.2021 01:00:00');
  });
});
