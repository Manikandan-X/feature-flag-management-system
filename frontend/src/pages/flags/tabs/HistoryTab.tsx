import { useEffect, useState } from "react";
import { Alert, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from "@mui/material";
import { auditLogApi } from "../../../api/resources";
import { getApiErrorMessage } from "../../../api/client";
import { LoadingState, EmptyState } from "../../../components/common/States";
import { actionColor, actionLabel, formatDiffValue, formatTimestamp } from "../../../utils/auditFormat";
import type { AuditLogResponse } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function HistoryTab({ flagId }: { flagId: number }) {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    auditLogApi
      .entityHistory("FEATURE_FLAG", flagId)
      .then(setLogs)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [flagId, isAdmin]);

  if (!isAdmin) {
    return (
      <Alert severity="info" variant="outlined">
        Only admins can view change history.
      </Alert>
    );
  }

  if (loading) return <LoadingState label="Loading history…" />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Shows create, update, enable/disable and schedule changes to this flag. Rollout and
        user-targeting changes are logged against their own entity IDs — see the full{" "}
        <strong>Audit Log</strong> page for those.
      </Typography>
      {logs.length === 0 ? (
        <EmptyState title="No history yet" description="Changes to this flag will appear here." />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Before</TableCell>
              <TableCell>After</TableCell>
              <TableCell>When</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const color = actionColor[log.action];
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
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {formatDiffValue(log.old_value)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {formatDiffValue(log.new_value)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(log.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
