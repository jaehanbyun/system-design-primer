import { getEntry } from 'astro:content';
import { isPageTask, plans, taskId, type PlanId, type Task, type TaskKind } from '~/data/plans';
import { href, isExternal, readingMinutes } from '~/utils/site';

export interface ResolvedTask {
	id: string;
	title: string;
	url?: string;
	external: boolean;
	kind: TaskKind;
	minutes?: number;
	note?: string;
}

export const kindLabels: Record<TaskKind, string> = {
	read: '읽기',
	watch: '강의',
	practice: '실습',
	review: '복습',
};

async function resolveTask(task: Task, plan: PlanId): Promise<ResolvedTask> {
	if (isPageTask(task)) {
		const entry = await getEntry('docs', task.page);
		if (!entry) throw new Error(`Study plan "${plan}" references a missing page: ${task.page}`);
		return {
			id: taskId(task),
			title: entry.data.title,
			url: href(task.page),
			external: false,
			kind: task.kind ?? 'read',
			minutes: readingMinutes(entry.body),
			note: task.note,
		};
	}
	return {
		id: task.id,
		title: task.label,
		url: task.href ? href(task.href) : undefined,
		external: task.href ? isExternal(task.href) : false,
		kind: task.kind,
		note: task.note,
	};
}

export async function resolvePhase(plan: PlanId, index: number): Promise<ResolvedTask[]> {
	const phase = plans[plan].phases[index];
	if (!phase) throw new Error(`Study plan "${plan}" has no phase ${index}`);
	return Promise.all(phase.tasks.map((task) => resolveTask(task, plan)));
}

export async function resolvePlan(plan: PlanId): Promise<ResolvedTask[][]> {
	return Promise.all(plans[plan].phases.map((_, index) => resolvePhase(plan, index)));
}
