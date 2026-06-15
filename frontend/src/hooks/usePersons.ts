import { useQuery } from '@tanstack/react-query';
import { getPersons } from '../api/persons';

export const usePersons = () =>
  useQuery({
    queryKey: ['persons'],
    queryFn: getPersons,
    staleTime: Infinity,
  });
