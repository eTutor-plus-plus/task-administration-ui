import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { SortMeta } from 'primeng/api';

import { PageResult } from '../models';

/**
 * Base class for CRUD API services.
 */
export abstract class ApiService<TDto extends object, TModifyDto extends object, TKey extends string | number, TFilter extends object, TSingleDto extends object = TDto> {

  /**
   * The HTTP client.
   */
  protected readonly http: HttpClient;

  /**
   * The base API URL for the entity endpoint.
   */
  protected readonly apiUrl: string;

  /**
   * The service name used for logging.
   */
  protected readonly serviceName: string;

  /**
   * Creates a new instance of class ApiService.
   *
   * @param serviceName The service name used for logging.
   * @param baseUrl The base API URL for the entity endpoint (must not end with a slash).
   */
  protected constructor(serviceName: string, baseUrl: string) {
    if (baseUrl.endsWith('/'))
      throw new Error('baseUrl must not end with a slash');

    this.http = inject(HttpClient);
    this.apiUrl = baseUrl;
    this.serviceName = serviceName;
  }

  /**
   * Loads the entities for the specified page.
   *
   * @param offset The page offset.
   * @param perPage The amount of entries per page.
   * @param sort The sort expressions.
   * @param filter The filter expression.
   * @return Paged list of entities.
   */
  load(offset: number, perPage: number, sort?: SortMeta[] | null, filter?: TFilter): Promise<PageResult<TDto>> {
    // page
    const page = Math.floor(offset / perPage);
    let params = new HttpParams()
      .set('size', perPage)
      .set('page', page);

    // sort
    if (sort) {
      for (let i = 0; i < sort.length; i++) {
        params = params.append('sort', `${sort[i].field},${sort[i].order < 0 ? 'desc' : 'asc'}`);
      }
    }

    // filter
    if (filter)
      params = this.setFilterParam(params, filter);

    // send request
    console.info(`[${this.serviceName}] Loading page`);
    return new Promise<PageResult<TDto>>((resolve, reject) => this.http.get<PageResult<TDto>>(this.apiUrl, {params}).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed loading page`, err);
        reject(err);
      }
    }));
  }

  /**
   * Loads the entity with the specified identifier.
   *
   * @param id The identifier.
   */
  get(id: TKey): Promise<TSingleDto> {
    console.info(`[${this.serviceName}] Loading ${id}`);
    return new Promise<TSingleDto>((resolve, reject) => this.http.get<TSingleDto>(this.apiUrl + '/' + encodeURIComponent(id)).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed loading ${id}`, err);
        reject(err);
      }
    }));
  }

  /**
   * Adds the filter parameter to the HTTP parameters.
   *
   * @param params The already existing filter parameters.
   * @param filter The filter value.
   * @return Modified HTTP parameters
   */
  protected abstract setFilterParam(params: HttpParams, filter: TFilter): HttpParams;

  /**
   * Creates a new entity.
   *
   * @param data The entity data.
   * @return The created entity.
   */
  create(data: TModifyDto): Promise<TDto> {
    console.info(`[${this.serviceName}] Create`);
    // console.log(data)
    // console.log(this.apiUrl)
    return new Promise<TDto>((resolve, reject) => this.http.post<TDto>(this.apiUrl, data).subscribe({
      next: value => resolve(value),
      error: err => {
        console.error(`[${this.serviceName}] Failed creating`, err);
        reject(err);
      }
    }));
  }


  /**
   * Updates an existing entity.
   *
   * @param id The identifier of the entity.
   * @param data The full updated entity data.
   * @param concurrencyToken The concurrency token to prevent modification of different users.
   */
  update(id: TKey, data: TModifyDto, concurrencyToken: string | null = null): Promise<void> {
    console.info(`[${this.serviceName}] Update ` + id);
    let headers = new HttpHeaders();
    if (concurrencyToken)
      headers = headers.set('If-Unmodified-Since', concurrencyToken);
    return new Promise((resolve, reject) => this.http.put(this.apiUrl + '/' + encodeURIComponent(id), data, {headers}).subscribe({
      next: () => resolve(),
      error: err => {
        console.error(`[${this.serviceName}] Failed updating ` + id, err);
        reject(err);
      }
    }));
  }

  /**
   * Deletes the entity with the specified identifier.
   *
   * @param id The entity identifier.
   */
  delete(id: TKey): Promise<void> {
    console.info(`[${this.serviceName}] Delete ` + id);
    return new Promise<void>((resolve, reject) => this.http.delete(this.apiUrl + '/' + encodeURIComponent(id)).subscribe({
      next: () => resolve(),
      error: err => {
        console.error(`[${this.serviceName}] Failed deleting ` + id, err);
        reject(err);
      }
    }));
  }
}
