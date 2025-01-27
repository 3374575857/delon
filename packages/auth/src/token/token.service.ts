import { inject, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { DelonAuthConfig } from '../auth.config';
import { DA_STORE_TOKEN, IStore } from '../store/interface';
import { AuthReferrer, ITokenModel, ITokenService } from './interface';

export function DA_SERVICE_TOKEN_FACTORY(): ITokenService {
  return new TokenService(inject(DelonAuthConfig), inject(DA_STORE_TOKEN));
}

export class TokenService implements ITokenService {
  private change$ = new BehaviorSubject<ITokenModel | null>(null);
  private _referrer: AuthReferrer = {};

  constructor(private options: DelonAuthConfig, @Inject(DA_STORE_TOKEN) private store: IStore) {}

  get login_url(): string | undefined {
    return this.options.login_url;
  }

  get referrer() {
    return this._referrer;
  }

  set(data: ITokenModel): boolean {
    this.change$.next(data);
    return this.store.set(this.options.store_key!, data);
  }

  get(type?: any);
  get<T extends ITokenModel>(type?: new () => T): T {
    const data = this.store.get(this.options.store_key!);
    return type ? (Object.assign(new type(), data) as T) : (data as T);
  }

  clear(options: { onlyToken: boolean } = { onlyToken: false }) {
    let data: ITokenModel | null = null;
    if (options.onlyToken === true) {
      data = this.get() as ITokenModel;
      data.token = ``;
      this.set(data);
    } else {
      this.store.remove(this.options.store_key!);
    }
    this.change$.next(data);
  }

  change(): Observable<ITokenModel | null> {
    return this.change$.pipe(share());
  }
}
