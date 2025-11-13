<script>
    import { onMount } from 'svelte';
    import dayjs from 'dayjs';
    export let data;

    let loading = false;
    let timeLogs = data?.timeLogs || [];
    let grouped = [];
    let query = '';
    $: filteredGrouped = grouped.filter((g) =>
        (g.title || '')
            .toString()
            .toLowerCase()
            .includes((query || '').toLowerCase())
    );

    onMount(async () => {
        // Optional client refresh to keep list current
        loading = true;
        try {
            const response = await fetch('/api/time-logs');
            if (response.ok) {
                const json = await response.json();
                timeLogs = json.timeLogs || timeLogs;
                grouped = groupByTask(timeLogs);
            }
        } catch (e) {
            console.error('Failed to refresh time logs:', e);
        } finally {
            loading = false;
        }
    });

    $: grouped = groupByTask(timeLogs);

    function formatDateTime(dt) {
        return dayjs(dt).format('YYYY-MM-DD HH:mm:ss');
    }

    function formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    }

    function groupByTask(logs) {
        const map = new Map();
        for (const log of logs) {
            const taskId = log.task.id;
            if (!map.has(taskId)) {
                map.set(taskId, { taskId, title: log.task.title, logs: [] });
            }
            map.get(taskId).logs.push(log);
        }
        // Sort logs within each task by startTime desc
        const arr = Array.from(map.values());
        arr.forEach(group => group.logs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
        // Sort groups by title
        arr.sort((a, b) => a.title.localeCompare(b.title));
        return arr;
    }

    async function deleteLog(logId) {
        if (!confirm('Delete this time log?')) return;
        try {
            const res = await fetch(`/api/time-logs/${logId}`, { method: 'DELETE' });
            if (res.ok) {
                timeLogs = timeLogs.filter(l => l.id !== logId);
            }
        } catch (e) {
            console.error('Failed to delete log:', e);
        }
    }

    async function deleteTask(taskId) {
        if (!confirm('Delete this task and all its logs?')) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            if (res.ok) {
                timeLogs = timeLogs.filter(l => l.task.id !== taskId);
            }
        } catch (e) {
            console.error('Failed to delete task:', e);
        }
    }
</script>

<div class="logs-page">
    <div class="logs-container">
        <h1>Time Logs</h1>
        <div class="search-row">
            <input
                type="text"
                class="search-input"
                placeholder="Search tasks by name"
                bind:value={query}
            />
        </div>
        {#if loading}
            <div class="loading">Loading...</div>
        {:else}
            {#if grouped.length === 0}
                <div class="no-logs">No time logs found</div>
            {:else}
                <div class="task-cards">
                    {#each filteredGrouped as group}
                        <div class="task-card">
                            <div class="task-card-header">
                                <h3>{group.title}</h3>
                                <button class="btn btn-sm btn-danger" on:click={() => deleteTask(group.taskId)}>Delete Task</button>
                            </div>
                            <div class="task-card-body">
                                {#each group.logs as log}
                                    <div class="log-row">
                                        <div class="log-time">{formatDateTime(log.startTime)}{log.endTime ? ` - ${formatDateTime(log.endTime)}` : ''}</div>
                                        <div class="log-actions">
                                            <span class="log-duration">{log.duration ? formatDuration(log.duration) : 'Running'}</span>
                                            <button class="btn btn-sm btn-secondary" on:click={() => deleteLog(log.id)}>Delete</button>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</div>

<style>
    .logs-container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: var(--space-6); }

    .search-row { display: flex; justify-content: center; margin-bottom: var(--space-4); }
    .search-input { width: 100%; max-width: 520px; padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-primary); background: var(--bg-elevated); color: var(--text-primary); outline: none; }
    .search-input::placeholder { color: var(--text-muted); }

    .task-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); align-items: start; }
    .task-card { background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); padding: var(--space-4); }
    .task-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); }
    .task-card-header h3 { margin: 0; color: var(--text-primary); }
    .task-card-body { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-2); padding-right: var(--space-2); }

    .log-row { display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); }
    .log-time { color: var(--text-secondary); font-size: 0.9rem; }
    .log-actions { display: flex; align-items: center; gap: var(--space-3); }
    .log-duration { font-weight: 600; color: var(--text-primary); }

    .no-logs, .loading { padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-primary); }

    @media (max-width: 768px) {
        .task-cards { grid-template-columns: 1fr; }
    }
</style>
