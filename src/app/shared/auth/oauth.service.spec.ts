import { TestBed } from '@angular/core/testing';
import { AuthHttpService } from '../http-services/auth.http-service';
import { HttpBackend } from '@angular/common/http';

describe('OauthService', () => {
  let authHttp: AuthHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpBackend,
          useValue: {}
        }
      ]
    });
    authHttp = TestBed.inject(AuthHttpService);
  });

  it('should be created', () => {
    expect(authHttp).toBeTruthy();
  });
});
