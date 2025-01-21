import { ReadonlyURLSearchParams } from 'next/dist/client/components/navigation';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';

export function useSearchParams(): [any, React.Dispatch<React.SetStateAction<ReadonlyURLSearchParams | null>>] {
  const router = useRouter();
  const [queryParams, setQueryParams] = useState<ReadonlyURLSearchParams | null>(useNextSearchParams());

  function handleQueryParams(searchParams: ReadonlyURLSearchParams | null) {
    setQueryParams(searchParams);
    router.push(
      {
        pathname: router.pathname,
        query: searchParams?.toString(),
      },
      undefined,
      { shallow: true },
    );
  }

  return [queryParams, handleQueryParams] as any;
}
