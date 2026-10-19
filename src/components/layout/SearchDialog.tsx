import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { messages } from '../../data/messages.ts';
import { closeSearch } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { searchProducts } from '../../services/productService.ts';
import { formatMoney } from '../../utils/currency.ts';
import { resolvePrice } from '../../utils/pricing.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import styles from './SearchDialog.module.css';

export function SearchDialog() {
  const open = useAppSelector((state) => state.ui.searchOpen);
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchProducts(query, 10), [query]);

  const close = () => {
    dispatch(closeSearch());
    setQuery('');
  };

  return (
    <Modal open={open} title={messages.search.title} onClose={close}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="visually-hidden" htmlFor="site-search">
          {messages.header.search}
        </label>
        <input
          id="site-search"
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={messages.header.searchPlaceholder}
          autoComplete="off"
        />
        {query ? (
          <Button variant="ghost" onClick={() => setQuery('')}>
            {messages.header.clearSearch}
          </Button>
        ) : null}
      </form>
      {query && results.length === 0 ? (
        <p>
          {messages.search.empty}. {messages.search.emptyHint}
        </p>
      ) : null}
      {results.length > 0 ? (
        <p className="eyebrow">{messages.search.results(results.length)}</p>
      ) : null}
      <div className={styles.results}>
        {results.map((product) => {
          const price = resolvePrice(product);
          return (
            <Link
              className={styles.item}
              key={product.id}
              to={`/product/${product.slug}`}
              onClick={close}
            >
              <SafeImage
                src={product.images[0]?.src ?? '/placeholders/products/fallback.svg'}
                alt={product.images[0]?.alt ?? product.name}
                width={80}
                height={80}
              />
              <span>
                <span className={styles.name}>{product.name}</span>
                <br />
                {formatMoney(price.amount, product.currency)}
              </span>
            </Link>
          );
        })}
      </div>
    </Modal>
  );
}
