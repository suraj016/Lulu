import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

export type AccordionItemData = {
  id: string;
  title: string;
  content: string[];
};

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div>
      {items.map((item) => {
        const expanded = openId === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div className={styles.item} key={item.id}>
            <button
              className={styles.trigger}
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpenId(expanded ? null : item.id)}
            >
              {item.title}
              <ChevronDown
                size={18}
                aria-hidden="true"
                style={{
                  transform: expanded ? 'rotate(180deg)' : undefined,
                  transition: 'transform var(--duration) var(--ease)',
                }}
              />
            </button>
            {expanded ? (
              <div className={styles.panel} id={panelId}>
                <ul>
                  {item.content.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
