import { AuthenticatedRequest } from "@/middlewares";
import { activitiesService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest,res: Response) {
    const { userId } = req;

    const activities = await activitiesService.getActivities(userId);
    res.status(httpStatus.OK).send(activities)
}

export async function reserveActivity(req: AuthenticatedRequest,res: Response) {
    const { userId } = req;
    const { activityId } = req.params;

    const activities = await activitiesService.reserveActivity(userId, Number(activityId));
    res.status(httpStatus.CREATED).send('Reserva feita com sucesso!')
}