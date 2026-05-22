import { Service } from "@/domain/services/index";
import { APIInstanceProps, api } from "@/domain/services/api";

type SignOut = () => Promise<void>;

class SignOutService extends Service<SignOut, () => void> {
  constructor(private readonly api: APIInstanceProps) {
    super();
  }
  async perform(signOut: SignOut): Promise<() => void> {
    return this.api.registerInterceptorTokenManager(signOut);
  }
}

const signOutService = new SignOutService(api);

export { signOutService };
