import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pageContentApi,
  type LifeEventCreate,
  type LifeEventUpdate,
  type AchievementCreate,
  type AchievementUpdate,
  type EducationCreate,
  type EducationUpdate,
  type CareerCreate,
  type CareerUpdate,
  type PersonValueCreate,
  type PersonValueUpdate,
  type QuoteCreate,
  type QuoteUpdate,
  type MemorialMessageCreate,
} from '../api/pageContent';


export const pageContentKeys = {
  all: ['pageContent'] as const,
  content: (pageId: string) => [...pageContentKeys.all, 'full', pageId] as const,
  lifeEvents: (pageId: string) => [...pageContentKeys.all, 'lifeEvents', pageId] as const,
  achievements: (pageId: string) => [...pageContentKeys.all, 'achievements', pageId] as const,
  education: (pageId: string) => [...pageContentKeys.all, 'education', pageId] as const,
  career: (pageId: string) => [...pageContentKeys.all, 'career', pageId] as const,
  values: (pageId: string) => [...pageContentKeys.all, 'values', pageId] as const,
  quotes: (pageId: string) => [...pageContentKeys.all, 'quotes', pageId] as const,
  messages: (pageId: string) => [...pageContentKeys.all, 'messages', pageId] as const,
};


export function usePageContent(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.content(pageId ?? ''),
    queryFn: () => pageContentApi.getPageContent(pageId!),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000,
  });
}


export function useLifeEvents(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.lifeEvents(pageId ?? ''),
    queryFn: () => pageContentApi.listLifeEvents(pageId!),
    enabled: !!pageId,
  });
}

export function useCreateLifeEvent(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LifeEventCreate) => pageContentApi.createLifeEvent(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.lifeEvents(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdateLifeEvent(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: LifeEventUpdate }) =>
      pageContentApi.updateLifeEvent(eventId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.lifeEvents(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteLifeEvent(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => pageContentApi.deleteLifeEvent(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.lifeEvents(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useReorderLifeEvents(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => pageContentApi.reorderLifeEvents(pageId, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.lifeEvents(pageId) });
    },
  });
}


export function useAchievements(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.achievements(pageId ?? ''),
    queryFn: () => pageContentApi.listAchievements(pageId!),
    enabled: !!pageId,
  });
}

export function useCreateAchievement(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AchievementCreate) => pageContentApi.createAchievement(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.achievements(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdateAchievement(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ achievementId, data }: { achievementId: string; data: AchievementUpdate }) =>
      pageContentApi.updateAchievement(achievementId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.achievements(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteAchievement(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => pageContentApi.deleteAchievement(achievementId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.achievements(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useReorderAchievements(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => pageContentApi.reorderAchievements(pageId, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.achievements(pageId) });
    },
  });
}


export function useEducation(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.education(pageId ?? ''),
    queryFn: () => pageContentApi.listEducation(pageId!),
    enabled: !!pageId,
  });
}

export function useCreateEducation(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EducationCreate) => pageContentApi.createEducation(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.education(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdateEducation(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ educationId, data }: { educationId: string; data: EducationUpdate }) =>
      pageContentApi.updateEducation(educationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.education(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteEducation(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (educationId: string) => pageContentApi.deleteEducation(educationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.education(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useReorderEducation(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => pageContentApi.reorderEducation(pageId, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.education(pageId) });
    },
  });
}


export function useCareer(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.career(pageId ?? ''),
    queryFn: () => pageContentApi.listCareer(pageId!),
    enabled: !!pageId,
  });
}

export function useCreateCareer(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CareerCreate) => pageContentApi.createCareer(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.career(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdateCareer(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ careerId, data }: { careerId: string; data: CareerUpdate }) =>
      pageContentApi.updateCareer(careerId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.career(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteCareer(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (careerId: string) => pageContentApi.deleteCareer(careerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.career(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useReorderCareer(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => pageContentApi.reorderCareer(pageId, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.career(pageId) });
    },
  });
}


export function usePersonValues(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.values(pageId ?? ''),
    queryFn: () => pageContentApi.listValuesGrouped(pageId!),
    enabled: !!pageId,
  });
}

export function useCreatePersonValue(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonValueCreate) => pageContentApi.createValue(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.values(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdatePersonValue(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: PersonValueUpdate }) =>
      pageContentApi.updateValue(valueId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.values(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeletePersonValue(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => pageContentApi.deleteValue(valueId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.values(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}


export function useQuotes(pageId: string | undefined) {
  return useQuery({
    queryKey: pageContentKeys.quotes(pageId ?? ''),
    queryFn: () => pageContentApi.listQuotes(pageId!),
    enabled: !!pageId,
  });
}

export function useCreateQuote(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuoteCreate) => pageContentApi.createQuote(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.quotes(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useUpdateQuote(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: QuoteUpdate }) =>
      pageContentApi.updateQuote(quoteId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.quotes(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteQuote(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => pageContentApi.deleteQuote(quoteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.quotes(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useReorderQuotes(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => pageContentApi.reorderQuotes(pageId, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.quotes(pageId) });
    },
  });
}


export function useMemorialMessages(pageId: string | undefined, includePending = false) {
  return useQuery({
    queryKey: [...pageContentKeys.messages(pageId ?? ''), includePending] as const,
    queryFn: () => pageContentApi.listMessages(pageId!, includePending),
    enabled: !!pageId,
  });
}

export function useCreateMemorialMessage(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MemorialMessageCreate) => pageContentApi.createMessage(pageId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.messages(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useApproveMemorialMessage(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => pageContentApi.approveMessage(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.messages(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useRejectMemorialMessage(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => pageContentApi.rejectMessage(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.messages(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}

export function useDeleteMemorialMessage(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => pageContentApi.deleteMessage(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.messages(pageId) });
      void queryClient.invalidateQueries({ queryKey: pageContentKeys.content(pageId) });
    },
  });
}
