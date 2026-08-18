import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { auditLogApi } from "../../api/resources";
import { getApiErrorMessage } from "../../api/client";
import {
  actionColor,
  actionLabel,
  entityLabel,
  formatDiffValue,
  formatTimestamp,
} from "../../utils/auditFormat";
import type { AuditAction, AuditEntityType, AuditLogResponse } from "../../types";

const ACTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "ENABLE",
  "DISABLE",
  "SCHEDULE",
  "ROLLOUT_UPDATE",
  "USER_ASSIGNMENT",
  "USER_ASSIGNMENT_DELETE",
  "ROLLBACK",
];

const ENTITIES: AuditEntityType[] = [
  "FEATURE_FLAG",
  "ENVIRONMENT",
  "FEATURE_ROLLOUT",
  "USER_ASSIGNMENT",
];

// Actions the backend's RollbackService is built to reverse.
const ROLLBACKABLE: AuditAction[] = ["UPDATE", "ENABLE", "DISABLE", "ROLLOUT_UPDATE", "SCHEDULE"];

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | "">("");
  const [rollingBackId, setRollingBackId] = useState<number | null>(null);
  const [rollbackMessage, setRollbackMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    auditLogApi
      .listAll()
      .then((data) => setLogs(data.sort((a, b) => b.id - a.id)))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) => (!actionFilter || l.action === actionFilter) && (!entityFilter || l.entity_type === entityFilter),
      ),
    [logs, actionFilter, entityFilter],
  );

  async function rollback(log: AuditLogResponse) {
    setRollbackMessage(null);
    setRollingBackId(log.id);
    try {
      await auditLogApi.rollback(log.id);
      setRollbackMessage(`Rolled back ${entityLabel[log.entity_type].toLowerCase()} #${log.entity_id}.`);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setRollingBackId(null);
    }
  }

  if (loading) return <LoadingState label="Loading audit log…" />;
  if (error && logs.length === 0) return <ErrorState message={error} />;

  return (
    <Box>
      <PageHeader
        eyebrow="Governance"
        title="Audit log"
        description="Every create, update, enable/disable, rollout, schedule, and targeting change — with one-click rollback."
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField
          select
          label="Action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | "")}
          sx={{ width: { xs: "100%", sm: 200 } }}
        >
          <MenuItem value="">All actions</MenuItem>
          {ACTIONS.map((a) => (
            <MenuItem key={a} value={a}>
              {actionLabel[a]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Entity"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value as AuditEntityType | "")}
          sx={{ width: { xs: "100%", sm: 200 } }}
        >
          <MenuItem value="">All entities</MenuItem>
          {ENTITIES.map((e) => (
            <MenuItem key={e} value={e}>
              {entityLabel[e]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {rollbackMessage && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setRollbackMessage(null)}>
          {rollbackMessage}
        </Alert>
      )}
      {error && logs.length > 0 && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<HistoryRoundedIcon fontSize="large" />} title="No matching audit entries" description="Try clearing the filters." />
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Before</TableCell>
                <TableCell>After</TableCell>
                <TableCell>By user</TableCell>
                <TableCell>When</TableCell>
                <TableCell align="right">Rollback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((log) => {
                const color = actionColor[log.action];
                const canRollback = ROLLBACKABLE.includes(log.action);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip
                        label={actionLabel[log.action]}
                        size="small"
                        sx={{ color, backgroundColor: alpha(color, 0.14), border: `1px solid ${alpha(color, 0.4)}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{entityLabel[log.entity_type]}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        #{log.entity_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }} noWrap component="div">
                        {formatDiffValue(log.old_value)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }} noWrap component="div">
                        {formatDiffValue(log.new_value)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                        {log.user_id ? `#${log.user_id}` : "system"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(log.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canRollback ? (
                        <Button
                          size="small"
                          startIcon={<ReplayRoundedIcon fontSize="small" />}
                          onClick={() => rollback(log)}
                          disabled={rollingBackId === log.id}
                        >
                          {rollingBackId === log.id ? "Rolling back…" : "Rollback"}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
