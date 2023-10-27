import { getActivities, reserveActivity } from '@/controllers';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const activityRouter = Router();

activityRouter
    .all('/*', authenticateToken)
    .get('/activity', getActivities)
    .post('/:activityId', reserveActivity)


export { activityRouter };