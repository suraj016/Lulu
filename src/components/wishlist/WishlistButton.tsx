import { Heart } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { IconButton } from '../ui/IconButton.tsx';
import styles from './WishlistButton.module.css';

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.productId === productId),
  );

  return (
    <IconButton
      className={[styles.button, className ?? ''].filter(Boolean).join(' ')}
      label={active ? messages.actions.wishlistRemove : messages.actions.wishlistAdd}
      data-active={active ? 'true' : 'false'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dispatch(toggleWishlist(productId));
      }}
    >
      <Heart size={18} fill={active ? 'currentColor' : 'none'} />
    </IconButton>
  );
}
