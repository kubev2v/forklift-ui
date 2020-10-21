import { AxiosError } from 'axios';

export type KubeClientError = AxiosError<{ message: string }>;
