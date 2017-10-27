import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { AuthInfo } from '../model/auth-info';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class AuthService {

  // a behavior subject is guaranteed to give you a value when you subscribe
  // create a default anonymous user to pass into our Behavior Subject of type AuthInfo
  // this behavior subject makes auth state available to the whole app without having to subscribe to the login method
  static UNKNOWN_USER = new AuthInfo(null);
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(AuthService.UNKNOWN_USER);
  public userEmail: String = 'anonymous';

  constructor(private afAuth: AngularFireAuth) { }

  login(email, password): Observable <any> {
    // call the login method on angularfire's firebaseauth module, returns promise, convert to observable.
    let promiseFromAngularFire = this.afAuth.auth.signInWithEmailAndPassword(email, password);
    return this.fromFirebaseAuthPromise(promiseFromAngularFire);
  }

  signUp(email, password): Observable<any> {
    // call the createUser method on angularfire's firebaseauth module, returns promise, convert to observable.
    // this.userEmail = email;
    return this.fromFirebaseAuthPromise(this.afAuth.auth.createUserWithEmailAndPassword(email, password ));
  }

  // method to convert a promise into an observable to return above.
  fromFirebaseAuthPromise(promise): Observable<any> {
    const subject = new Subject<any>();
    promise.then(
      res => {
        // when logging in, create auth info instance and pass in uid generated by firebase of newly logged in user.
        const authInfo = new AuthInfo(this.afAuth.auth.currentUser.uid);
        // console.log(this.auth.getAuth().auth.email);
        this.userEmail = this.afAuth.auth.currentUser.email;
        // then emit new value from AuthInfo observable by calling next.
        this.authInfo$.next(authInfo);
        subject.next(res);
        subject.complete();
      },
      err => {
        // also call error if there is a problem passing in the error info.
        this.authInfo$.error(err);
        subject.error(err);
        subject.complete();
      }
    );
    return subject.asObservable();
  }

  logout() {
    this.afAuth.auth.signOut();
    // emit a new value to all components that user is no longer authenticated.
    this.authInfo$.next(AuthService.UNKNOWN_USER);
  }
}
