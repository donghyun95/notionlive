import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      color?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    color?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    image?: string | null;
    color?: string | null;
  }
}
