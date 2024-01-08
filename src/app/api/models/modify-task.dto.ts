import { StatusEnum } from './task-status.enum';

export interface ModifyTaskDto {
    /**
     * The ID of the organizational unit.
     */
    organizationalUnitId: number;

    /**
     * The title of the task.
     */
    title: string;

    /**
     * The description of the task in German.
     */
    descriptionDe: string;

    /**
     * The description of the task in English.
     */
    descriptionEn: string;

    /**
     * The difficulty of the task.
     */
    difficulty: number;

    /**
     * The maximum points of the task.
     */
    maxPoints: number;

    /**
     * The type of the task.
     */
    taskType: string;

    /**
     * The status of the task.
     */
    status: StatusEnum;

    /**
     * The ID of the task group.
     */
    taskGroupId?: number;

    /**
     * The IDs of the task categories.
     */
    taskCategoryIds?: Array<number>;

    /**
     * The additional data of the task.
     */
    additionalData?: Record<string, unknown>;
}
