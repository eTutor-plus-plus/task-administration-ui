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

}

/**
 * The filter properties for organizational units.
 */
export interface OrganizationalUnitFilter {
  name?: string;
}
