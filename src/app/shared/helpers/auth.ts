import { HttpHeaders } from '@angular/common/http';

export function headersForAuth(token: string): { [name: string]: string | string[] } {
  return {
    // "Authorization" is name to be used in http header
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: `Bearer ${token}`,
  };
}

export function tokenFromHeaders(headers: HttpHeaders): string|undefined {
  const auth = headers.get('Authorization');
  if (auth?.substr(0,7) !== 'Bearer ') return undefined;
  return auth.substr(7);
}
