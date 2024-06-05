import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import * as jose from 'jose';

import { AuthService } from './auth.service';
import { API_URL } from '../app.config';
import { AppComponent } from '../app.component';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: API_URL, useValue: 'http://localhost' },
        provideRouter([{ path: 'auth', children: [{ path: 'login', component: AppComponent }] }]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('dke-auth-token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load stored token from storage', () => {
    // Arrange
    localStorage.setItem('dke-auth-token', JSON.stringify({
      'access_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVpZCI6MSwiZnVsbF9hZG1pbiI6dHJ1ZSwicm9sZXMiOltdLCJpc3MiOiJzZWxmIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3MTcyNTg3MTAsImdpdmVuX25hbWUiOiJlVHV0b3IiLCJpYXQiOjE3MTcyNTY5MTAsImZhbWlseV9uYW1lIjoiQWRtaW5pc3RyYXRvciIsImVtYWlsIjoiZXR1dG9yQGV4YW1wbGUuY29tIn0.KKkk48-rz8OpvAqclr5LvcKEt5iDI4XlMXqoK232asKijIQgyFTiJQIoet8QcVpHcC7Jkf-qaB517qUjE9aGdCPwyIqfGCsIS3e8xD-T5ieVqVLyXmB2_0DuVYHo1ik3ZlXhrPqEtipjTvRQLFwwxX6xRKqYaPw0moWOU_jqTo3H7RLjvnSkZ-_E2Lw4cj_O7IWbESSkE4cYdhaZDhMa6GjdMty2owbzcOBUUskUOHWp-ZGPmpiFYRhAayr_LnS4cCcjpFYU2638crQe7uCplRpuSIBmSJjsR65BITtEtKwTLcoW_VUBma3dJaDE14U1y_C-r4BBL3i4rLDy8-pNK38XEWFWfTN0pY798PIzJMKnha2Q462GYj-4rAuEVSoVgFo8E5LcCvfTo_tq0fIxGVDNalNKzgH1harI0V0detXyVUcWv0zF-ytdvZ-UMX2ckttOx407L3cdvt4u65DufzUB4FupMwN2OjdEsvC1n581ECA1fd0-ucrwBTddjhZB0btn',
      'refresh_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzZWMiOiJ7YmNyeXB0fSQyYSQxMCQ2bG1BUExQUFEueW9wTTd2Vk1wZFlPei5yb3dtWWguOG5JMDltLy9XMS9Oa1gyTG9yam9LaSIsImlzcyI6InNlbGYiLCJleHAiOjE3MTcyNTg5MTAsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzE3MjU2OTEwLCJzdWJfaWQiOiJhZG1pbiJ9.esxOP2jG9-mgn4RUfgwc9-WYeLoqfqlrCeDpSkySOjCL5lbRCW4ql3P3zZqt7ZF1XQviZkLSoK-U6x6D37_v5XKJib33jBgWz57oPqWgDS0ZblbDbeXhWe03tun8EN9V9hqZdqafap80OIqMV501DvRMRZ_lDviDzoq9NtgcOdbdEvqIjVxQs6TjDHO5fpDCghUad3ZxpUaiPfiDi7nX1ebsdnzld-lrJKVmO-zuXgB0lKoj-wyYu1TjPod7eFPbycdHVjF9hW5t5sMKwPW_uvhvswjeF6bsa7bo3IH9ymecsIIQD5sYvFs83kAVgiPovmdWtVIkrbVzMepDF1dMh_oOrNU2DXpto1U07HBN8VNTrHGljF6-l_wvSKFUYM3EQ-o4GHsHcjp1OXa8JNpL1AUr4MpWqvSaPDtDOwOaTkTY6z8tYHdMF4PTBTp415XzwLseRALydo1PDT7N6lAVqoEgyY1BSJHYczauBMV_YzXx1z7MIzO7O_83UXUMzfE6HaUZ',
      'token_type': 'Bearer',
      'expires_in': 1800
    }));

    // Act
    const authServiceFromStorage = new AuthService(null!, null!, null!);

    // Assert
    expect(authServiceFromStorage.user).not.toBeNull();
    expect(authServiceFromStorage.authHeaderValue).not.toBeNull();
  });

  it('should not fail on loading invalid stored token from storage', () => {
    // Arrange
    localStorage.setItem('dke-auth-token', 'invalid-json');

    // Act
    const authServiceFromStorage = new AuthService(null!, null!, null!);

    // Assert
    expect(authServiceFromStorage.user).toBeNull();
    expect(authServiceFromStorage.authHeaderValue).toBeNull();
  });

  it('should fail login with invalid credentials', () => {
    // Arrange
    const username = 'admin';
    const password = 'invalid';

    // Act & Assert
    const promise = service.login(username, password).then(() => {
      throw new Error('Error');
    }).catch(err => {
      expect(err).toBeDefined();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.authHeaderValue).toBeNull();
      expect(service.user).toBeNull();
      expect(service.isRefreshSubscriptionActive()).toBe(false);
    });

    // Request
    const req = httpTestingController.expectOne('http://localhost/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({username, password});
    req.flush(null, {status: 400, statusText: 'Bad Request'});
    httpTestingController.verify();

    return promise;
  });

  it('should successfully login with valid credentials', () => {
    // Arrange
    const username = 'admin';
    const password = 'test';
    const accessToken = new jose.UnsecuredJWT({
      uid: 10,
      full_name: 'Test User',
      roles: [{organizationalUnit: 1, role: 'INSTRUCTOR'}],
      full_admin: false,
      preferred_username: 'test',
      given_name: 'Test',
      family_name: 'User',
      email: 'test@example.com'
    })
      .setIssuedAt()
      .setIssuer('self')
      .setSubject('test')
      .setExpirationTime('5 minutes')
      .encode();
    const refreshToken = new jose.UnsecuredJWT({
      token_type: 'refresh',
      sub_id: 'test',
      sec: 'token-secret'
    })
      .setIssuedAt()
      .setIssuer('self')
      .setExpirationTime('5 minutes')
      .encode();

    // Act & Assert
    const promise = service.login(username, password).then(() => {
      expect(localStorage.getItem('dke-auth-token')).toContain(accessToken);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.authHeaderValue).toBe('Bearer ' + accessToken);
      expect(service.user).toBeDefined();
      expect(service.user?.maxRole).toBe('INSTRUCTOR');
      expect(service.user?.userName).toBe('test');
      expect(service.user?.firstName).toBe('Test');
      expect(service.user?.lastName).toBe('User');
      expect(service.user?.email).toBe('test@example.com');
      expect(service.user?.isFullAdmin).toBe(false);
      expect(service.user?.roles).toStrictEqual([{organizationalUnit: 1, role: 'INSTRUCTOR'}]);
      expect(service.isRefreshSubscriptionActive()).toBe(true);
    });

    // Request
    const req = httpTestingController.expectOne('http://localhost/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({username, password});
    req.flush({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 300
    });
    httpTestingController.verify();

    return promise;
  });

  it('should not be authenticated with outdated access token', () => {
    // Arrange
    const username = 'admin';
    const password = 'test';
    const accessToken = new jose.UnsecuredJWT({
      uid: 10,
      full_name: 'Test User',
      roles: [{organizationalUnit: 1, role: 'INSTRUCTOR'}],
      full_admin: false,
      preferred_username: 'test',
      given_name: 'Test',
      family_name: 'User',
      email: 'test@example.com'
    })
      .setIssuedAt((new Date().getTime() - 10000) / 1000)
      .setIssuer('self')
      .setSubject('test')
      .setExpirationTime((new Date().getTime() - 1000) / 1000)
      .encode();
    const refreshToken = new jose.UnsecuredJWT({
      token_type: 'refresh',
      sub_id: 'test',
      sec: 'token-secret'
    })
      .setIssuedAt()
      .setIssuer('self')
      .setExpirationTime('1 second')
      .encode();

    // Act & Assert
    const promise = service.login(username, password).then(() => {
      expect(localStorage.getItem('dke-auth-token')).toBeDefined();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isRefreshSubscriptionActive()).toBe(false);
    });

    // Request
    const req = httpTestingController.expectOne('http://localhost/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({username, password});
    req.flush({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 300
    });
    httpTestingController.verify();

    return promise;
  });

  it('should delete token from storage on logout', () => {
    // Arrange
    localStorage.setItem('dke-auth-token', JSON.stringify({
      'access_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVpZCI6MSwiZnVsbF9hZG1pbiI6dHJ1ZSwicm9sZXMiOltdLCJpc3MiOiJzZWxmIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3MTcyNTg3MTAsImdpdmVuX25hbWUiOiJlVHV0b3IiLCJpYXQiOjE3MTcyNTY5MTAsImZhbWlseV9uYW1lIjoiQWRtaW5pc3RyYXRvciIsImVtYWlsIjoiZXR1dG9yQGV4YW1wbGUuY29tIn0.KKkk48-rz8OpvAqclr5LvcKEt5iDI4XlMXqoK232asKijIQgyFTiJQIoet8QcVpHcC7Jkf-qaB517qUjE9aGdCPwyIqfGCsIS3e8xD-T5ieVqVLyXmB2_0DuVYHo1ik3ZlXhrPqEtipjTvRQLFwwxX6xRKqYaPw0moWOU_jqTo3H7RLjvnSkZ-_E2Lw4cj_O7IWbESSkE4cYdhaZDhMa6GjdMty2owbzcOBUUskUOHWp-ZGPmpiFYRhAayr_LnS4cCcjpFYU2638crQe7uCplRpuSIBmSJjsR65BITtEtKwTLcoW_VUBma3dJaDE14U1y_C-r4BBL3i4rLDy8-pNK38XEWFWfTN0pY798PIzJMKnha2Q462GYj-4rAuEVSoVgFo8E5LcCvfTo_tq0fIxGVDNalNKzgH1harI0V0detXyVUcWv0zF-ytdvZ-UMX2ckttOx407L3cdvt4u65DufzUB4FupMwN2OjdEsvC1n581ECA1fd0-ucrwBTddjhZB0btn',
      'refresh_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzZWMiOiJ7YmNyeXB0fSQyYSQxMCQ2bG1BUExQUFEueW9wTTd2Vk1wZFlPei5yb3dtWWguOG5JMDltLy9XMS9Oa1gyTG9yam9LaSIsImlzcyI6InNlbGYiLCJleHAiOjE3MTcyNTg5MTAsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzE3MjU2OTEwLCJzdWJfaWQiOiJhZG1pbiJ9.esxOP2jG9-mgn4RUfgwc9-WYeLoqfqlrCeDpSkySOjCL5lbRCW4ql3P3zZqt7ZF1XQviZkLSoK-U6x6D37_v5XKJib33jBgWz57oPqWgDS0ZblbDbeXhWe03tun8EN9V9hqZdqafap80OIqMV501DvRMRZ_lDviDzoq9NtgcOdbdEvqIjVxQs6TjDHO5fpDCghUad3ZxpUaiPfiDi7nX1ebsdnzld-lrJKVmO-zuXgB0lKoj-wyYu1TjPod7eFPbycdHVjF9hW5t5sMKwPW_uvhvswjeF6bsa7bo3IH9ymecsIIQD5sYvFs83kAVgiPovmdWtVIkrbVzMepDF1dMh_oOrNU2DXpto1U07HBN8VNTrHGljF6-l_wvSKFUYM3EQ-o4GHsHcjp1OXa8JNpL1AUr4MpWqvSaPDtDOwOaTkTY6z8tYHdMF4PTBTp415XzwLseRALydo1PDT7N6lAVqoEgyY1BSJHYczauBMV_YzXx1z7MIzO7O_83UXUMzfE6HaUZ',
      'token_type': 'Bearer',
      'expires_in': 1800
    }));
    const authServiceFromStorage = new AuthService(null!, null!, null!);

    // Act
    authServiceFromStorage.logout();

    // Assert
    expect(localStorage.getItem('dke-auth-token')).toBeNull();
    expect(authServiceFromStorage.isRefreshSubscriptionActive()).toBe(false);
    expect(authServiceFromStorage.user).toBeNull();
    expect(authServiceFromStorage.authHeaderValue).toBeNull();
  });

  it('should refresh access token with valid refresh token', () => {
    // Arrange
    const accessToken = new jose.UnsecuredJWT({
      uid: 10,
      full_name: 'Test User',
      roles: [{organizationalUnit: 1, role: 'INSTRUCTOR'}],
      full_admin: false,
      preferred_username: 'test',
      given_name: 'Test',
      family_name: 'User',
      email: 'test@example.com'
    })
      .setIssuedAt()
      .setIssuer('self')
      .setSubject('test')
      .setExpirationTime('5 minutes')
      .encode();
    const refreshToken = new jose.UnsecuredJWT({
      token_type: 'refresh',
      sub_id: 'test',
      sec: 'token-secret'
    })
      .setIssuedAt()
      .setIssuer('self')
      .setExpirationTime('5 minutes')
      .encode();
    const oldRefresh = 'eyJhbGciOiJSUzI1NiJ9.eyJzZWMiOiJ7YmNyeXB0fSQyYSQxMCQ2bG1BUExQUFEueW9wTTd2Vk1wZFlPei5yb3dtWWguOG5JMDltLy9XMS9Oa1gyTG9yam9LaSIsImlzcyI6InNlbGYiLCJleHAiOjE3MTcyNTg5MTAsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzE3MjU2OTEwLCJzdWJfaWQiOiJhZG1pbiJ9.esxOP2jG9-mgn4RUfgwc9-WYeLoqfqlrCeDpSkySOjCL5lbRCW4ql3P3zZqt7ZF1XQviZkLSoK-U6x6D37_v5XKJib33jBgWz57oPqWgDS0ZblbDbeXhWe03tun8EN9V9hqZdqafap80OIqMV501DvRMRZ_lDviDzoq9NtgcOdbdEvqIjVxQs6TjDHO5fpDCghUad3ZxpUaiPfiDi7nX1ebsdnzld-lrJKVmO-zuXgB0lKoj-wyYu1TjPod7eFPbycdHVjF9hW5t5sMKwPW_uvhvswjeF6bsa7bo3IH9ymecsIIQD5sYvFs83kAVgiPovmdWtVIkrbVzMepDF1dMh_oOrNU2DXpto1U07HBN8VNTrHGljF6-l_wvSKFUYM3EQ-o4GHsHcjp1OXa8JNpL1AUr4MpWqvSaPDtDOwOaTkTY6z8tYHdMF4PTBTp415XzwLseRALydo1PDT7N6lAVqoEgyY1BSJHYczauBMV_YzXx1z7MIzO7O_83UXUMzfE6HaUZ';
    localStorage.setItem('dke-auth-token', JSON.stringify({
      'access_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVpZCI6MSwiZnVsbF9hZG1pbiI6dHJ1ZSwicm9sZXMiOltdLCJpc3MiOiJzZWxmIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3MTcyNTg3MTAsImdpdmVuX25hbWUiOiJlVHV0b3IiLCJpYXQiOjE3MTcyNTY5MTAsImZhbWlseV9uYW1lIjoiQWRtaW5pc3RyYXRvciIsImVtYWlsIjoiZXR1dG9yQGV4YW1wbGUuY29tIn0.KKkk48-rz8OpvAqclr5LvcKEt5iDI4XlMXqoK232asKijIQgyFTiJQIoet8QcVpHcC7Jkf-qaB517qUjE9aGdCPwyIqfGCsIS3e8xD-T5ieVqVLyXmB2_0DuVYHo1ik3ZlXhrPqEtipjTvRQLFwwxX6xRKqYaPw0moWOU_jqTo3H7RLjvnSkZ-_E2Lw4cj_O7IWbESSkE4cYdhaZDhMa6GjdMty2owbzcOBUUskUOHWp-ZGPmpiFYRhAayr_LnS4cCcjpFYU2638crQe7uCplRpuSIBmSJjsR65BITtEtKwTLcoW_VUBma3dJaDE14U1y_C-r4BBL3i4rLDy8-pNK38XEWFWfTN0pY798PIzJMKnha2Q462GYj-4rAuEVSoVgFo8E5LcCvfTo_tq0fIxGVDNalNKzgH1harI0V0detXyVUcWv0zF-ytdvZ-UMX2ckttOx407L3cdvt4u65DufzUB4FupMwN2OjdEsvC1n581ECA1fd0-ucrwBTddjhZB0btn',
      'refresh_token': oldRefresh,
      'token_type': 'Bearer',
      'expires_in': 1800
    }));
    const authService = new AuthService(TestBed.inject(HttpClient), null!, TestBed.inject(API_URL));

    // Act & Assert
    const promise = authService.refreshToken().then(() => {
      expect(localStorage.getItem('dke-auth-token')).toContain(accessToken);
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.authHeaderValue).toBe('Bearer ' + accessToken);
      expect(authService.user).toBeDefined();
      expect(authService.isRefreshSubscriptionActive()).toBe(true);
    });

    // Request
    const req = httpTestingController.expectOne('http://localhost/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(oldRefresh);
    req.flush({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 300
    });

    httpTestingController.verify();

    return promise;
  });

  it('should logout on refresh with invalid refresh token', () => {
    // Arrange
    const oldRefresh = 'eyJhbGciOiJSUzI1NiJ9.eyJzZWMiOiJ7YmNyeXB0fSQyYSQxMCQ2bG1BUExQUFEueW9wTTd2Vk1wZFlPei5yb3dtWWguOG5JMDltLy9XMS9Oa1gyTG9yam9LaSIsImlzcyI6InNlbGYiLCJleHAiOjE3MTcyNTg5MTAsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzE3MjU2OTEwLCJzdWJfaWQiOiJhZG1pbiJ9.esxOP2jG9-mgn4RUfgwc9-WYeLoqfqlrCeDpSkySOjCL5lbRCW4ql3P3zZqt7ZF1XQviZkLSoK-U6x6D37_v5XKJib33jBgWz57oPqWgDS0ZblbDbeXhWe03tun8EN9V9hqZdqafap80OIqMV501DvRMRZ_lDviDzoq9NtgcOdbdEvqIjVxQs6TjDHO5fpDCghUad3ZxpUaiPfiDi7nX1ebsdnzld-lrJKVmO-zuXgB0lKoj-wyYu1TjPod7eFPbycdHVjF9hW5t5sMKwPW_uvhvswjeF6bsa7bo3IH9ymecsIIQD5sYvFs83kAVgiPovmdWtVIkrbVzMepDF1dMh_oOrNU2DXpto1U07HBN8VNTrHGljF6-l_wvSKFUYM3EQ-o4GHsHcjp1OXa8JNpL1AUr4MpWqvSaPDtDOwOaTkTY6z8tYHdMF4PTBTp415XzwLseRALydo1PDT7N6lAVqoEgyY1BSJHYczauBMV_YzXx1z7MIzO7O_83UXUMzfE6HaUZ';
    localStorage.setItem('dke-auth-token', JSON.stringify({
      'access_token': 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVpZCI6MSwiZnVsbF9hZG1pbiI6dHJ1ZSwicm9sZXMiOltdLCJpc3MiOiJzZWxmIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3MTcyNTg3MTAsImdpdmVuX25hbWUiOiJlVHV0b3IiLCJpYXQiOjE3MTcyNTY5MTAsImZhbWlseV9uYW1lIjoiQWRtaW5pc3RyYXRvciIsImVtYWlsIjoiZXR1dG9yQGV4YW1wbGUuY29tIn0.KKkk48-rz8OpvAqclr5LvcKEt5iDI4XlMXqoK232asKijIQgyFTiJQIoet8QcVpHcC7Jkf-qaB517qUjE9aGdCPwyIqfGCsIS3e8xD-T5ieVqVLyXmB2_0DuVYHo1ik3ZlXhrPqEtipjTvRQLFwwxX6xRKqYaPw0moWOU_jqTo3H7RLjvnSkZ-_E2Lw4cj_O7IWbESSkE4cYdhaZDhMa6GjdMty2owbzcOBUUskUOHWp-ZGPmpiFYRhAayr_LnS4cCcjpFYU2638crQe7uCplRpuSIBmSJjsR65BITtEtKwTLcoW_VUBma3dJaDE14U1y_C-r4BBL3i4rLDy8-pNK38XEWFWfTN0pY798PIzJMKnha2Q462GYj-4rAuEVSoVgFo8E5LcCvfTo_tq0fIxGVDNalNKzgH1harI0V0detXyVUcWv0zF-ytdvZ-UMX2ckttOx407L3cdvt4u65DufzUB4FupMwN2OjdEsvC1n581ECA1fd0-ucrwBTddjhZB0btn',
      'refresh_token': oldRefresh,
      'token_type': 'Bearer',
      'expires_in': 1800
    }));
    const router = TestBed.inject(Router);
    const authService = new AuthService(TestBed.inject(HttpClient), router, TestBed.inject(API_URL));
    router.initialNavigation();

    // Act & Assert
    const promise = authService.refreshToken().then(() => {
      expect(localStorage.getItem('dke-auth-token')).toBeNull();
      expect(authService.isRefreshSubscriptionActive()).toBe(false);
      expect(authService.user).toBeNull();
      expect(authService.authHeaderValue).toBeNull();

      expect(router.routerState.snapshot.url).toBe('/auth/login');
      expect(router.lastSuccessfulNavigation?.extras.state).toStrictEqual({expired: true, username: 'admin'});
    });

    // Request
    const req = httpTestingController.expectOne('http://localhost/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(oldRefresh);
    req.flush(null, {status: 401, statusText: 'Unauthorized'});

    httpTestingController.verify();

    return promise;
  });
});
