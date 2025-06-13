import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!isPlatformBrowser(this.platformId)) {
            return next.handle(req);
        }

        const token = localStorage.getItem('token');
        if (token){
            const cloneReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token)
            });
            return next.handle(cloneReq).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401 || error.status === 403) {
                        // Token is invalid or expired, or user is not authorized
                        localStorage.removeItem('token');
                        localStorage.removeItem('userInfor');
                        this.router.navigate(['/auth-login']);
                    }
                    return throwError(() => error);
                })
            );
        } else {
            return next.handle(req);
        }
    }
}