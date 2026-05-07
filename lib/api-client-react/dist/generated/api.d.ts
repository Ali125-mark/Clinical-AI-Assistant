import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CaseAnalysis, ChatMessage, ChatSession, CreateCaseBody, CreateSessionBody, HealthStatus, PatientCase, PatientCaseWithAnalysis, SendMessageBody, SendMessageResponse, TranscribeAudioBody, TranscriptionResult, UpdateCaseBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all patient cases
 */
export declare const getListCasesUrl: () => string;
export declare const listCases: (options?: RequestInit) => Promise<PatientCase[]>;
export declare const getListCasesQueryKey: () => readonly ["/api/cases"];
export declare const getListCasesQueryOptions: <TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCasesQueryResult = NonNullable<Awaited<ReturnType<typeof listCases>>>;
export type ListCasesQueryError = ErrorType<unknown>;
/**
 * @summary List all patient cases
 */
export declare function useListCases<TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new patient case
 */
export declare const getCreateCaseUrl: () => string;
export declare const createCase: (createCaseBody: CreateCaseBody, options?: RequestInit) => Promise<PatientCase>;
export declare const getCreateCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
        data: BodyType<CreateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
    data: BodyType<CreateCaseBody>;
}, TContext>;
export type CreateCaseMutationResult = NonNullable<Awaited<ReturnType<typeof createCase>>>;
export type CreateCaseMutationBody = BodyType<CreateCaseBody>;
export type CreateCaseMutationError = ErrorType<unknown>;
/**
 * @summary Create a new patient case
 */
export declare const useCreateCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
        data: BodyType<CreateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCase>>, TError, {
    data: BodyType<CreateCaseBody>;
}, TContext>;
/**
 * @summary Get a patient case by ID
 */
export declare const getGetCaseUrl: (id: number) => string;
export declare const getCase: (id: number, options?: RequestInit) => Promise<PatientCaseWithAnalysis>;
export declare const getGetCaseQueryKey: (id: number) => readonly [`/api/cases/${number}`];
export declare const getGetCaseQueryOptions: <TData = Awaited<ReturnType<typeof getCase>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCase>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseQueryResult = NonNullable<Awaited<ReturnType<typeof getCase>>>;
export type GetCaseQueryError = ErrorType<void>;
/**
 * @summary Get a patient case by ID
 */
export declare function useGetCase<TData = Awaited<ReturnType<typeof getCase>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a patient case
 */
export declare const getUpdateCaseUrl: (id: number) => string;
export declare const updateCase: (id: number, updateCaseBody: UpdateCaseBody, options?: RequestInit) => Promise<PatientCase>;
export declare const getUpdateCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
        id: number;
        data: BodyType<UpdateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
    id: number;
    data: BodyType<UpdateCaseBody>;
}, TContext>;
export type UpdateCaseMutationResult = NonNullable<Awaited<ReturnType<typeof updateCase>>>;
export type UpdateCaseMutationBody = BodyType<UpdateCaseBody>;
export type UpdateCaseMutationError = ErrorType<unknown>;
/**
 * @summary Update a patient case
 */
export declare const useUpdateCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
        id: number;
        data: BodyType<UpdateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCase>>, TError, {
    id: number;
    data: BodyType<UpdateCaseBody>;
}, TContext>;
/**
 * @summary Delete a patient case
 */
export declare const getDeleteCaseUrl: (id: number) => string;
export declare const deleteCase: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
    id: number;
}, TContext>;
export type DeleteCaseMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCase>>>;
export type DeleteCaseMutationError = ErrorType<unknown>;
/**
 * @summary Delete a patient case
 */
export declare const useDeleteCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCase>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List all analyses for a case
 */
export declare const getListCaseAnalysesUrl: (id: number) => string;
export declare const listCaseAnalyses: (id: number, options?: RequestInit) => Promise<CaseAnalysis[]>;
export declare const getListCaseAnalysesQueryKey: (id: number) => readonly [`/api/cases/${number}/analyses`];
export declare const getListCaseAnalysesQueryOptions: <TData = Awaited<ReturnType<typeof listCaseAnalyses>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCaseAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCaseAnalyses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCaseAnalysesQueryResult = NonNullable<Awaited<ReturnType<typeof listCaseAnalyses>>>;
export type ListCaseAnalysesQueryError = ErrorType<unknown>;
/**
 * @summary List all analyses for a case
 */
export declare function useListCaseAnalyses<TData = Awaited<ReturnType<typeof listCaseAnalyses>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCaseAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Run AI analysis on a patient case
 */
export declare const getAnalyzeCaseUrl: (id: number) => string;
export declare const analyzeCase: (id: number, options?: RequestInit) => Promise<CaseAnalysis>;
export declare const getAnalyzeCaseMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof analyzeCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof analyzeCase>>, TError, {
    id: number;
}, TContext>;
export type AnalyzeCaseMutationResult = NonNullable<Awaited<ReturnType<typeof analyzeCase>>>;
export type AnalyzeCaseMutationError = ErrorType<void>;
/**
 * @summary Run AI analysis on a patient case
 */
export declare const useAnalyzeCase: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof analyzeCase>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof analyzeCase>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List all chat sessions
 */
export declare const getListChatSessionsUrl: () => string;
export declare const listChatSessions: (options?: RequestInit) => Promise<ChatSession[]>;
export declare const getListChatSessionsQueryKey: () => readonly ["/api/chat/sessions"];
export declare const getListChatSessionsQueryOptions: <TData = Awaited<ReturnType<typeof listChatSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChatSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listChatSessions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListChatSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listChatSessions>>>;
export type ListChatSessionsQueryError = ErrorType<unknown>;
/**
 * @summary List all chat sessions
 */
export declare function useListChatSessions<TData = Awaited<ReturnType<typeof listChatSessions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChatSessions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new chat session
 */
export declare const getCreateChatSessionUrl: () => string;
export declare const createChatSession: (createSessionBody: CreateSessionBody, options?: RequestInit) => Promise<ChatSession>;
export declare const getCreateChatSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChatSession>>, TError, {
        data: BodyType<CreateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createChatSession>>, TError, {
    data: BodyType<CreateSessionBody>;
}, TContext>;
export type CreateChatSessionMutationResult = NonNullable<Awaited<ReturnType<typeof createChatSession>>>;
export type CreateChatSessionMutationBody = BodyType<CreateSessionBody>;
export type CreateChatSessionMutationError = ErrorType<unknown>;
/**
 * @summary Create a new chat session
 */
export declare const useCreateChatSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChatSession>>, TError, {
        data: BodyType<CreateSessionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createChatSession>>, TError, {
    data: BodyType<CreateSessionBody>;
}, TContext>;
/**
 * @summary Delete a chat session
 */
export declare const getDeleteChatSessionUrl: (id: number) => string;
export declare const deleteChatSession: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteChatSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChatSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteChatSession>>, TError, {
    id: number;
}, TContext>;
export type DeleteChatSessionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteChatSession>>>;
export type DeleteChatSessionMutationError = ErrorType<unknown>;
/**
 * @summary Delete a chat session
 */
export declare const useDeleteChatSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChatSession>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteChatSession>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get messages in a session
 */
export declare const getGetChatMessagesUrl: (id: number) => string;
export declare const getChatMessages: (id: number, options?: RequestInit) => Promise<ChatMessage[]>;
export declare const getGetChatMessagesQueryKey: (id: number) => readonly [`/api/chat/sessions/${number}/messages`];
export declare const getGetChatMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getChatMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChatMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getChatMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetChatMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getChatMessages>>>;
export type GetChatMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages in a session
 */
export declare function useGetChatMessages<TData = Awaited<ReturnType<typeof getChatMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChatMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a message and get AI response
 */
export declare const getSendChatMessageUrl: (id: number) => string;
export declare const sendChatMessage: (id: number, sendMessageBody: SendMessageBody, options?: RequestInit) => Promise<SendMessageResponse>;
export declare const getSendChatMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendChatMessage>>, TError, {
        id: number;
        data: BodyType<SendMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendChatMessage>>, TError, {
    id: number;
    data: BodyType<SendMessageBody>;
}, TContext>;
export type SendChatMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendChatMessage>>>;
export type SendChatMessageMutationBody = BodyType<SendMessageBody>;
export type SendChatMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a message and get AI response
 */
export declare const useSendChatMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendChatMessage>>, TError, {
        id: number;
        data: BodyType<SendMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendChatMessage>>, TError, {
    id: number;
    data: BodyType<SendMessageBody>;
}, TContext>;
/**
 * @summary Transcribe audio for chat
 */
export declare const getTranscribeChatAudioUrl: () => string;
export declare const transcribeChatAudio: (transcribeAudioBody: TranscribeAudioBody, options?: RequestInit) => Promise<TranscriptionResult>;
export declare const getTranscribeChatAudioMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeChatAudio>>, TError, {
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof transcribeChatAudio>>, TError, {
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
export type TranscribeChatAudioMutationResult = NonNullable<Awaited<ReturnType<typeof transcribeChatAudio>>>;
export type TranscribeChatAudioMutationBody = BodyType<TranscribeAudioBody>;
export type TranscribeChatAudioMutationError = ErrorType<unknown>;
/**
 * @summary Transcribe audio for chat
 */
export declare const useTranscribeChatAudio: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeChatAudio>>, TError, {
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof transcribeChatAudio>>, TError, {
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
/**
 * @summary Transcribe audio to text (standalone, no case required)
 */
export declare const getTranscribeAudioStandaloneUrl: () => string;
export declare const transcribeAudioStandalone: (transcribeAudioBody: TranscribeAudioBody, options?: RequestInit) => Promise<TranscriptionResult>;
export declare const getTranscribeAudioStandaloneMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeAudioStandalone>>, TError, {
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof transcribeAudioStandalone>>, TError, {
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
export type TranscribeAudioStandaloneMutationResult = NonNullable<Awaited<ReturnType<typeof transcribeAudioStandalone>>>;
export type TranscribeAudioStandaloneMutationBody = BodyType<TranscribeAudioBody>;
export type TranscribeAudioStandaloneMutationError = ErrorType<unknown>;
/**
 * @summary Transcribe audio to text (standalone, no case required)
 */
export declare const useTranscribeAudioStandalone: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeAudioStandalone>>, TError, {
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof transcribeAudioStandalone>>, TError, {
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
/**
 * @summary Transcribe audio to text for a case
 */
export declare const getTranscribeAudioUrl: (id: number) => string;
export declare const transcribeAudio: (id: number, transcribeAudioBody: TranscribeAudioBody, options?: RequestInit) => Promise<TranscriptionResult>;
export declare const getTranscribeAudioMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeAudio>>, TError, {
        id: number;
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof transcribeAudio>>, TError, {
    id: number;
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
export type TranscribeAudioMutationResult = NonNullable<Awaited<ReturnType<typeof transcribeAudio>>>;
export type TranscribeAudioMutationBody = BodyType<TranscribeAudioBody>;
export type TranscribeAudioMutationError = ErrorType<unknown>;
/**
 * @summary Transcribe audio to text for a case
 */
export declare const useTranscribeAudio: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transcribeAudio>>, TError, {
        id: number;
        data: BodyType<TranscribeAudioBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof transcribeAudio>>, TError, {
    id: number;
    data: BodyType<TranscribeAudioBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map