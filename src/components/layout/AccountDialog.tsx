import { messages } from '../../data/messages.ts';
import { closeAccount } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';

export function AccountDialog() {
  const open = useAppSelector((state) => state.ui.accountOpen);
  const dispatch = useAppDispatch();

  return (
    <Modal
      open={open}
      title={messages.account.title}
      onClose={() => dispatch(closeAccount())}
    >
      <p>{messages.account.body}</p>
      <div style={{ marginTop: '1.25rem' }}>
        <Button to="/shop" variant="primary" onClick={() => dispatch(closeAccount())}>
          {messages.actions.continueShopping}
        </Button>
      </div>
    </Modal>
  );
}
