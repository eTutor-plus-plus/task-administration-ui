import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { API_URL } from '../../app.config';
import { ModifyOrganizationalUnitDto, OrganizationalUnitDto } from '../models';
import { ApiService } from './api.service';

/**
 * API-service for organizational units.
 */
@Injectable({providedIn: 'root'})
export class OrganizationalUnitService extends ApiService<OrganizationalUnitDto, ModifyOrganizationalUnitDto, number, OrganizationalUnitFilter> {

  /**
   * Creates a new instance of class OrganizationalUnitService.
   */
  constructor(@Inject(API_URL) apiUrl: string) {
    super('OrganizationalUnitService', apiUrl + '/api/organizationalUnit');
  }

  protected override setFilterParam(params: HttpParams, filter: OrganizationalUnitFilter): HttpParams {
    if (filter.name)
      return params.set('filter', filter.name);
    return params;
  }

  /**
   * Initiates synchronization of the organizational unit with Moodle.
   *
   * @param id The organizational unit identifier.
   */
  syncWithMoodle(id: number): Promise<void> {
    console.info(`[${this.serviceName}] Sync with moodle ` + id);
    return new Promise<void>((resolve, reject) => this.http.post(this.apiUrl + '/' + encodeURIComponent(id), null).subscribe({
      next: () => resolve(),
      error: err => {
        console.error(`[${this.serviceName}] Failed sync with moodle ` + id, err);
        reject(err);
      }
    }));
  }

}

/**
 * The filter properties for organizational units.
 */
export interface OrganizationalUnitFilter {
  name?: string;
}
