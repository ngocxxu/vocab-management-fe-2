import { verifyUser } from '@/actions';
import { LayoutClient } from './LayoutClient';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const user = await verifyUser();

  return (
    <LayoutClient
      currentUser={user}
    >
      {props.children}
    </LayoutClient>
  );
}
