import { URL, URLSearchParams } from 'url';

import fetch, { Headers, Request, RequestInit, Response } from 'node-fetch';

export interface HttpResponse<T> extends Response{
    parsedBody?: T
}

export interface RequestOpts {
    body?: unknown;
    ignoreApiPath?: boolean;
    endpoint: string;
    params?:
      | URLSearchParams
      | string
      | {[key: string]: string | string[] | undefined }
      | Iterable<[string, string]>
      | Array<[string, string]>;
}

export interface BasicAuthenticationCredentials {
    password: string;
    username: string;
}

export type Credentials = BasicAuthenticationCredentials

export interface HttpClientConfig {
    cookies?: boolean;
    credentials?: Credentials;
    url: string;
}

export abstract class HttpClient {
    protected abstract apiPath: string;

    private cookieString?: string;

    constructor(protected config: HttpClientConfig) {}

    public get<T>(
        opts: RequestOpts,
        args: RequestInit = {method: 'get'}
    ): Promise<HttpResponse<T>> {
        return this.http<T>(opts, args);
    }

    public delete<T>(
        opts: RequestOpts,
        args: RequestInit = { method: 'delete' }
      ): Promise<HttpResponse<T>> {
        return this.http<T>(opts, args);
    }

    public post<T>(
        opts: RequestOpts,
        args: RequestInit = { method: 'post', body: JSON.stringify(opts.body) }
      ): Promise<HttpResponse<T>> {
        return this.http<T>(opts, args);
    }

    protected async buildRequest(opts: RequestOpts, init: RequestInit){
        const url = this.buildUrl(opts)
        const headers = this.buildHeaders();
        const request = new Request(url.toString(), {headers, ...init});

        if (this.config.cookies && this.cookieString){
            request.headers.set('cookie', this.cookieString)
        }

        return request;
    }

    private buildUrl(opts: RequestOpts){
        let cleanEndpoint = `${opts.endpoint.replace(/^\//,'')}`
        if (!opts.ignoreApiPath){
            cleanEndpoint = `${this.apiPath}/${cleanEndpoint}`
        }
        const url = new URL(cleanEndpoint, this.config.url)

        if(opts.params){
            const params = new URLSearchParams(opts.params);
            params.forEach((value, name) => url.searchParams.append(name, value))
        }
        console.log('URL:', url)
        return url;
    }

    protected buildAuthoriaztionHeader(){
        if (!this.config.credentials){
            return;
        }
        if('username' in this.config.credentials){
            const {username, password} = this.config.credentials;
            const buffer = Buffer.from(`${username}:${password}`)
            return `Basic ${buffer.toString('base64')}`;
        }
    }

    private buildHeaders(){
        const headers = new Headers({'Content-Type': 'application/json'});
        const authorization = this.buildAuthoriaztionHeader();
        if (authorization){
            headers.set('Authorization', authorization)
        }
        return headers;
    }

    private async http<T>(opts: RequestOpts, args: RequestInit){
        const request = await this.buildRequest(opts, args);

        const response: HttpResponse<T> = await fetch(request);
        const setCookies = response.headers.raw()['set-cookie']
        if (setCookies){
            this.cookieString = this.parseCookies(setCookies)
        }

        try{
            response.parsedBody = await response.json();
        } catch (ex) {}

        if(!response.ok){
            throw new Error(
                [
                  `[${response.status}]`,
                  request.method.toUpperCase(),
                  `${request.url}\n`,
                  JSON.stringify(response.parsedBody, null, 2)
                ].join(' ')
            );
        }
        return response;
    }

    private parseCookies(cookies: string[]){
        return cookies
          .map((entry) => {
              const parts = entry.split(';');
              const cookiePart = parts[0];
              return cookiePart;
          })
          .join(';')
    }

}