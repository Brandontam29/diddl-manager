export type BackupStats = {
  totalRequested: number;
  successful: string[];
  failed: { path: string; reason: string }[];
};

export const generateBackupReport = (stats: BackupStats): string => {
  return `Backup Report
Date: ${new Date().toISOString()}

Summary:
Total Files Requested: ${stats.totalRequested}
Successfully Added: ${stats.successful.length}
Failed: ${stats.failed.length}

---

Files Successfully Added:
${stats.successful.map((p) => `- ${p}`).join("\n")}

Files Failed to Add:
${stats.failed.map((f) => `- ${f.path} (${f.reason})`).join("\n")}
`;
};
