import { Dependency, Subscription } from '@/domain/services/api';

export type StateCallback = () => void;
export type SetState<T = any> = (
  newState: Partial<T>,
  cb?: StateCallback
) => void;
export type Subscriptions = {
  [key: string]: Subscription;
}

export class StatefulUseCase<State> {
  protected state: State;
  protected setState: SetState<State>;
  public onFocusDependency: any;
  public subscriptionDependencies?: Subscriptions;
  public dependencies: Dependency[];

  constructor(
    state: State,
    setStateCb: SetState<State>,
    onFocusDependency?: any
  ) {
    this.state = state;
    this.setState = (newState, cb) => {
      this.state = Object.assign({}, this.state, newState);
      setStateCb(newState, cb);
    };
    this.onFocusDependency = onFocusDependency;
    this.dependencies = [];
  }

  public getState(): State {
    return this.state;
  }

  public updateOnFocusDependency(onFocusDependency: any): void {
    this.onFocusDependency = onFocusDependency;
  }

  public dispose = async () => {
    const subs = this.subscriptionDependencies;
    if (subs) {
      for (const sub in subs) {
        subs[sub]();
      }
    }
  };

  public async initSubscriptions(): Promise<void> {}
  public async init(): Promise<void> {}
  public async onFocus(): Promise<void> {}
}
