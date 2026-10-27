export type TMcpPlanState = 'ok' | 'locked';
export type TMcpAccessState = 'ok' | 'disabled';
export type TMcpServerState = 'ok' | 'missing';

export type TMcpReadiness = {
  plan: TMcpPlanState;
  access: TMcpAccessState;
  server: TMcpServerState;
};
