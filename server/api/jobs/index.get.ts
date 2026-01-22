import { getAllJobs } from '~/server/db';

export default defineEventHandler(async (event) => {
  try {
    const jobs = getAllJobs();

    return {
      success: true,
      data: jobs
    };
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch jobs'
    });
  }
});