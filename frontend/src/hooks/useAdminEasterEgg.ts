import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SEQUENCE = ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

export function useAdminEasterEgg() {
  const navigate = useNavigate();
  const progress = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const expected = SEQUENCE[progress.current];
      if (e.key === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          navigate('/admin');
        }
      } else {
        progress.current = e.key === SEQUENCE[0] ? 1 : 0;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
