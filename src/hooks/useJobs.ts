
import { useAllJobs, useJobById, useMyJobs, useOpenJobs } from './job/useJobQueries';
import { useCreateJob, useUpdateJob } from './job/useJobMutations';

export function useJobs() {
  return {
    // Queries
    useAllJobs,
    useJobById,
    useMyJobs,
    useOpenJobs,
    
    // Mutations
    useCreateJob,
    useUpdateJob,
  };
}
