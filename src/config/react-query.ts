import type { MutationMeta, QueryClientConfig, QueryMeta } from "@tanstack/react-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { LocationState } from "@shared/types/app";
import { __PLATFORM__, QK_ME } from "@shared/utils/constants";
import { router as sellersRouter } from "@sellers/routes/router";
import { router as gestaoRouter } from "@gestao/routes/router";

type RequestMeta = QueryMeta | MutationMeta | undefined;

function navigate(state: LocationState) {
  const router = __PLATFORM__ === "GESTAO" ? gestaoRouter : sellersRouter;
  const routerState = router.state.location.state as LocationState;

  router.navigate(".", {
    replace: true,
    state: {
      ...routerState,
      ...state,
    },
  });
}

function handleRequestSuccess(requestMeta: RequestMeta) {
  if (requestMeta) {
    navigate({
      toast: {
        status: "success",
        description: requestMeta.success as string,
      },
    });
  }
}

function handleRequestError(
  requestError: unknown,
  requestKey: readonly unknown[] | undefined,
  requestMeta: RequestMeta,
) {
  const isMeRequest = requestKey?.join() === [QK_ME].join();

  if (requestError instanceof AxiosError && !isMeRequest) {
    if (requestError.response?.status === 401) {
      navigate({ authRequired: true });
    } else if (requestError.response?.status === 409) {
      requestMeta?.conflict &&
        navigate({
          toast: {
            status: "error",
            description: requestMeta.conflict as string,
          },
        });
    } else if (requestMeta) {
      navigate({
        toast: {
          status: "error",
          description: requestMeta.error as string,
        },
      });
    }
  }
}

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onSuccess(_data, query) {
      handleRequestSuccess(query.meta);
    },
    onError(error, query) {
      handleRequestError(error, query.options.queryKey, query.meta);
    },
  }),
  mutationCache: new MutationCache({
    onSuccess(_data, _variables, _context, mutation) {
      handleRequestSuccess(mutation.meta);
    },
    onError(error, _variables, _context, mutation) {
      handleRequestError(error, mutation.options.mutationKey, mutation.meta);
    },
  }),
};

export const queryClient = new QueryClient(queryClientConfig);
