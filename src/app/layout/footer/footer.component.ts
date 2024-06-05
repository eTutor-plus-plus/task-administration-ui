import { Component, OnDestroy, OnInit } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { DateTime } from 'luxon';

import { environment } from '../../../environments/environment';
import { SystemHealthService } from '../../api';

/**
 * Layout-component: Footer
 */
@Component({
  selector: 'dke-footer',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {

  /**
   * The URL to the impress page.
   */
  impressUrl: string;

  /**
   * The version string.
   */
  readonly version: string;

  /**
   * The version date.
   */
  readonly versionDate: string;

  /**
   * The version string.
   */
  serverVersion?: string;

  /**
   * The version date.
   */
  serverVersionDate?: string;

  private sub?: Subscription;

  /**
   * Creates a new instance of class FooterComponent.
   */
  constructor(private readonly translationService: TranslocoService,
              private readonly healthService: SystemHealthService) {
    this.impressUrl = environment.impressUrl + '?lang=' + translationService.getActiveLang();
    this.version = `${environment.version}#${environment.git.shortSha}`;
    this.versionDate = DateTime.fromISO(environment.git.commitDate).toFormat('dd.MM.yyyy HH:mm:ss');
  }

  /**
   * Listens to language changes.
   */
  ngOnInit(): void {
    this.sub = this.translationService.langChanges$
      .subscribe(lang => this.impressUrl = environment.impressUrl + '?lang=' + lang);
    this.healthService.loadAppInfo().then(info => {
      if (info.build) {
        this.serverVersion = info.build?.version;
        if (info.git)
          this.serverVersion += '#' + info.git?.commit.id['describe-short'];
      }
      if (info.git)
        this.serverVersionDate = info.git?.commit.time ? DateTime.fromISO(info.git.commit.time).toFormat('dd.MM.yyyy HH:mm:ss') : '';
    });
  }

  /**
   * Unsubscribes from subscriptions.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
