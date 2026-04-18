import { auth } from '@/lib/auth';
import Providers from '../Providers/queryProviders';
import { LiveblocksProviders } from '../Providers/liveblocksProvider';

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <Providers session={session}>
      <LiveblocksProviders>{children}</LiveblocksProviders>
    </Providers>
  );
}
