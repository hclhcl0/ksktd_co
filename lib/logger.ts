import { prisma } from './prisma';

export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';

export async function logActivity(data: {
  unitName: string;
  username: string;
  action: LogAction;
  entityType: string;
  entityId?: string;
  details?: string | object;
}) {
  try {
    const detailsStr = typeof data.details === 'object' 
      ? JSON.stringify(data.details) 
      : data.details;

    await prisma.activityLog.create({
      data: {
        unitName: data.unitName,
        username: data.username,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: detailsStr,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
